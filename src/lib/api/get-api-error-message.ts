/**
 * REST error extraction.
 *
 * The backend has no exception filter today (CLAUDE.md §9), so the live shape is
 * the bare class-validator / ValidationPipe default:
 *
 *   { statusCode: 400, message: string[] | string, error: "Bad Request" }
 *
 * `message` is an array of free-text sentences, each prefixed with the property
 * name ("email must be an email") — NOT a structured { field: reason } map.
 *
 * NOTE: revisit if/when the standardizing exception filter ships and restructures
 * validation failures (e.g. into a { field, constraints }[] array). The fallback
 * chain below is shape-agnostic; only the per-field extraction would change.
 */

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.'

interface ApiErrorBody {
  statusCode?: number
  message?: string | string[]
  error?: string
}

interface ApiError {
  response?: { data?: ApiErrorBody; status?: number }
  message?: string
}

/** True for an axios/fetch-style error carrying a parsed JSON body. */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('response' in error || 'isAxiosError' in error)
  )
}

function firstMessage(message: string | string[] | undefined): string | undefined {
  if (Array.isArray(message)) return message.length > 0 ? message[0] : undefined
  if (typeof message === 'string' && message.trim()) return message
  return undefined
}

/**
 * The single user-facing message for an error. Fallback chain (CLAUDE.md §9):
 * top-level `message` → backend `error` label → JS Error.message → hardcoded.
 */
export function getApiErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    const data = error.response?.data
    const fromMessage = firstMessage(data?.message)
    if (fromMessage) return fromMessage
    if (data?.error && data.error.trim()) return data.error
    if (error.message && error.message.trim()) return error.message
    return FALLBACK_MESSAGE
  }

  if (error instanceof Error && error.message.trim()) return error.message

  return FALLBACK_MESSAGE
}

/**
 * Best-effort map of field name → message, by reading the property name each
 * class-validator sentence is prefixed with ("email must be an email" → email).
 * Only associates a message when its leading token looks like a field name.
 */
export function extractFieldErrors(error: unknown): Record<string, string> {
  if (!isApiError(error)) return {}
  const message = error.response?.data?.message
  if (!Array.isArray(message)) return {}

  const fields: Record<string, string> = {}
  for (const sentence of message) {
    if (typeof sentence !== 'string') continue
    const field = sentence.trim().split(/\s+/)[0]
    // A field name is a single lowerCamel token, not a sentence fragment.
    if (field && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(field) && !(field in fields)) {
      fields[field] = sentence
    }
  }
  return fields
}
