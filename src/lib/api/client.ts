import axios, { type AxiosResponse } from 'axios'
import { useAuthStore } from '@/store/auth-store'

/** Every REST response is wrapped in this envelope (CLAUDE.md §2). */
export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  meta?: unknown
}

/** Pull the resource out of the envelope — query hooks return `data`, not the wrapper. */
export function unwrap<T>(response: AxiosResponse<ApiEnvelope<T>>): T {
  return response.data.data
}

/**
 * Base client. The /v1 prefix lives here, not in each hook (CLAUDE.md §2). The
 * base is the *relative* `/v1` so requests are same-origin — routed to the API by
 * the Vite dev proxy in development and by nginx in production (FE-SETUP-7). This
 * avoids cross-origin CORS entirely rather than depending on backend CORS config.
 */
export const apiClient = axios.create({
  baseURL: '/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach the JWT from the auth store to every authenticated request (FE-AUTH-7).
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401 → clear session + redirect to login. 403 (forbidden, still authenticated)
// must NOT clear the session — the specific error is surfaced by the caller.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().clearSession()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)
