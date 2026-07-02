import { useCallback, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useCollaboration } from '@/modules/collaboration/hooks/use-collaboration'
import { acceptChatProposal, declineChatProposal, proposeChatEdit } from '../api/ai-chat-api'
import {
  toErrorOutcome,
  toOutcomeFromWsEvent,
  toProposalAcceptErrorOutcome,
  toSuccessOutcome,
} from '../utils/chat-outcome'
import type { ChatOutcome, ChatTurn } from '../types/ai-chat.types'

/** Backstop only — the backend guarantees a WS response within ~120s (CLAUDE.md
 *  §9); this just covers the WS message itself being dropped in transit. */
const AI_CHAT_TIMEOUT_MS = 130_000

/**
 * The AI chat thread for one document (FE-CHAT-2/3). Author-only by virtue of
 * where it's mounted — the sidebar gates on `role` from useCollaboration and
 * only renders this for an author (CLAUDE.md §6), so the hook itself stays
 * role-agnostic. Each `send` appends a pending turn; `/chat` and `/chat/propose`
 * now return a `requestId` immediately (202) and the real outcome arrives later
 * as a WS frame on the document's existing connection (CLAUDE.md §9) — this hook
 * registers a waiter for that requestId rather than resolving from the mutation.
 */
export function useChatSession(documentId: string) {
  const { registerAiChatWaiter } = useCollaboration()
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const timeouts = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const hasActionableProposal = useCallback(
    (turnId: string, proposalId: string) =>
      turns.some(
        (turn) =>
          turn.id === turnId &&
          (turn.outcome?.kind === 'proposal' || turn.outcome?.kind === 'proposal-conflict') &&
          turn.outcome.proposalId === proposalId,
      ),
    [turns],
  )

  const resolveTurn = useCallback((turnId: string, outcome: ChatOutcome) => {
    setTurns((prev) =>
      prev.map((t) => (t.id === turnId ? { ...t, status: 'done', outcome, action: undefined } : t)),
    )
  }, [])

  const setTurnAction = useCallback((turnId: string, action: ChatTurn['action']) => {
    setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, action } : t)))
  }, [])

  // Register a one-shot waiter for the requestId a 202 response handed back,
  // with a client-side backstop in case the WS message itself never arrives.
  const awaitAiChatResult = useCallback(
    (turnId: string, requestId: string) => {
      setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, requestId } : t)))

      const unregister = registerAiChatWaiter(requestId, (event) => {
        clearTimeout(timeouts.current.get(requestId))
        timeouts.current.delete(requestId)
        resolveTurn(turnId, toOutcomeFromWsEvent(event))
      })

      const timer = setTimeout(() => {
        timeouts.current.delete(requestId)
        unregister()
        resolveTurn(turnId, {
          kind: 'error',
          message: 'The assistant is taking too long to respond. Please try again.',
        })
      }, AI_CHAT_TIMEOUT_MS)
      timeouts.current.set(requestId, timer)
    },
    [registerAiChatWaiter, resolveTurn],
  )

  const proposeMutation = useMutation({
    mutationFn: ({ prompt }: { turnId: string; prompt: string }) =>
      proposeChatEdit(documentId, prompt),
    onSuccess: ({ requestId }, { turnId }) => awaitAiChatResult(turnId, requestId),
    onError: (error, { turnId }) => resolveTurn(turnId, toErrorOutcome(error)),
  })

  const acceptMutation = useMutation({
    mutationFn: ({
      proposalId,
      confirm,
    }: {
      turnId: string
      proposalId: string
      confirm?: boolean
    }) => acceptChatProposal(documentId, proposalId, confirm),
    onMutate: ({ turnId }) => setTurnAction(turnId, 'accepting'),
    onSuccess: (data, { turnId }) => resolveTurn(turnId, toSuccessOutcome(data)),
    onError: (error, { turnId, proposalId }) =>
      resolveTurn(turnId, toProposalAcceptErrorOutcome(error, proposalId)),
  })

  const declineMutation = useMutation({
    mutationFn: ({ proposalId }: { turnId: string; proposalId: string }) =>
      declineChatProposal(documentId, proposalId),
    onMutate: ({ turnId }) => setTurnAction(turnId, 'declining'),
    onSuccess: (_, { turnId }) =>
      resolveTurn(turnId, { kind: 'declined', message: 'Proposal declined.' }),
    onError: (error, { turnId }) => resolveTurn(turnId, toErrorOutcome(error)),
  })

  const send = useCallback(
    (rawPrompt: string) => {
      const prompt = rawPrompt.trim()
      if (!prompt || proposeMutation.isPending) return
      const turnId = crypto.randomUUID()
      setTurns((prev) => [...prev, { id: turnId, prompt, status: 'pending' }])
      proposeMutation.mutate({ turnId, prompt })
    },
    [proposeMutation],
  )

  const accept = useCallback(
    (turnId: string, proposalId: string, confirm = true) => {
      if (acceptMutation.isPending || declineMutation.isPending) return
      if (!hasActionableProposal(turnId, proposalId)) return
      acceptMutation.mutate({ turnId, proposalId, confirm })
    },
    [acceptMutation, declineMutation.isPending, hasActionableProposal],
  )

  const decline = useCallback(
    (turnId: string, proposalId: string) => {
      if (acceptMutation.isPending || declineMutation.isPending) return
      if (!hasActionableProposal(turnId, proposalId)) return
      declineMutation.mutate({ turnId, proposalId })
    },
    [acceptMutation.isPending, declineMutation, hasActionableProposal],
  )

  return {
    turns,
    send,
    accept,
    decline,
    isSending: proposeMutation.isPending,
    isActing: acceptMutation.isPending || declineMutation.isPending,
  }
}
