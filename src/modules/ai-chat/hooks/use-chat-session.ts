import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sendChatMessage } from '../api/ai-chat-api'
import { toErrorOutcome, toSuccessOutcome } from '../utils/chat-outcome'
import type { ChatOutcome, ChatTurn } from '../types/ai-chat.types'

/**
 * The AI chat thread for one document (FE-CHAT-2/3). Author-only by virtue of
 * where it's mounted — the sidebar gates on `role` from useCollaboration and
 * only renders this for an author (CLAUDE.md §6), so the hook itself stays
 * role-agnostic. Each `send` appends a pending turn and resolves it into one of
 * the five outcomes once the request settles.
 */
export function useChatSession(documentId: string) {
  const [turns, setTurns] = useState<ChatTurn[]>([])

  const resolveTurn = useCallback((turnId: string, outcome: ChatOutcome) => {
    setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, status: 'done', outcome } : t)))
  }, [])

  const mutation = useMutation({
    mutationFn: ({ prompt }: { turnId: string; prompt: string }) =>
      sendChatMessage(documentId, prompt),
    onSuccess: (data, { turnId }) => resolveTurn(turnId, toSuccessOutcome(data)),
    onError: (error, { turnId }) => resolveTurn(turnId, toErrorOutcome(error)),
  })

  const send = useCallback(
    (rawPrompt: string) => {
      const prompt = rawPrompt.trim()
      if (!prompt || mutation.isPending) return
      const turnId = crypto.randomUUID()
      setTurns((prev) => [...prev, { id: turnId, prompt, status: 'pending' }])
      mutation.mutate({ turnId, prompt })
    },
    [mutation],
  )

  return { turns, send, isSending: mutation.isPending }
}
