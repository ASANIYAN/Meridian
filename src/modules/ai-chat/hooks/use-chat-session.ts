import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { acceptChatProposal, declineChatProposal, proposeChatEdit } from '../api/ai-chat-api'
import {
  toErrorOutcome,
  toProposalAcceptErrorOutcome,
  toProposalOutcome,
  toSuccessOutcome,
} from '../utils/chat-outcome'
import type { ChatOutcome, ChatTurn } from '../types/ai-chat.types'

/**
 * The AI chat thread for one document (FE-CHAT-2/3). Author-only by virtue of
 * where it's mounted — the sidebar gates on `role` from useCollaboration and
 * only renders this for an author (CLAUDE.md §6), so the hook itself stays
 * role-agnostic. Each `send` appends a pending turn and resolves it into a
 * staged proposal or a non-fatal outcome once the request settles.
 */
export function useChatSession(documentId: string) {
  const [turns, setTurns] = useState<ChatTurn[]>([])

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

  const proposeMutation = useMutation({
    mutationFn: ({ prompt }: { turnId: string; prompt: string }) =>
      proposeChatEdit(documentId, prompt),
    onSuccess: (data, { turnId }) => resolveTurn(turnId, toProposalOutcome(data)),
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
