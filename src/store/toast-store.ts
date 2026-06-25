import { create } from 'zustand'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration: number
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: { message: string; variant?: ToastVariant; duration?: number }) => string
  dismissToast: (id: string) => void
}

const DEFAULT_DURATION = 4000

/**
 * The toast queue — the second and last general-purpose Zustand store
 * (CLAUDE.md §3). Transient, action-independent events only ("Document created",
 * "Link copied", "Reconnecting…"). Never form validation errors.
 */
export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: ({ message, variant = 'default', duration = DEFAULT_DURATION }) => {
    const id = crypto.randomUUID()
    set((state) => ({ toasts: [...state.toasts, { id, message, variant, duration }] }))
    if (duration > 0) {
      setTimeout(() => get().dismissToast(id), duration)
    }
    return id
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
