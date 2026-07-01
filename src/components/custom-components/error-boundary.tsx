import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /**
   * What to render once a descendant has thrown. Either static UI, or a render
   * fn receiving a `reset` callback that clears the error and re-mounts the
   * subtree (only useful when the underlying cause may have gone away).
   */
  fallback: ReactNode | ((reset: () => void) => ReactNode)
  /**
   * When any identity in this array changes between renders, the boundary
   * clears its error and retries. Pass values that represent "a different thing
   * is being rendered now" (e.g. the current doc / route id), so one bad input
   * doesn't poison the next.
   */
  resetKeys?: unknown[]
  onError?: (error: Error, info: ErrorInfo) => void
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Generic React error boundary — the app's only one. Purely presentational and
 * prop-driven (components/ §5): it owns no data and knows nothing about what it
 * wraps. Must be a class component; React exposes no hook equivalent.
 *
 * Note the reach limit inherent to all error boundaries: they catch throws in
 * the render/lifecycle of the React subtree, NOT errors thrown from async work
 * a child kicked off (timers, promises, or a third-party view updating outside
 * React's cycle). Place it where the throw is synchronous to a render.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
  }

  componentDidUpdate(prev: ErrorBoundaryProps) {
    if (this.state.error === null) return
    const keys = this.props.resetKeys ?? []
    const prevKeys = prev.resetKeys ?? []
    const changed =
      keys.length !== prevKeys.length || keys.some((key, i) => !Object.is(key, prevKeys[i]))
    if (changed) this.reset()
  }

  private reset = () => this.setState({ error: null })

  render() {
    if (this.state.error !== null) {
      const { fallback } = this.props
      return typeof fallback === 'function' ? fallback(this.reset) : fallback
    }
    return this.props.children
  }
}
