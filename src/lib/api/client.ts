import axios, { type AxiosResponse } from 'axios'
import { env } from '@/config/env'
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

/** Base client. The global /v1 prefix lives here, not in each hook (CLAUDE.md §2). */
export const apiClient = axios.create({
  baseURL: `${env.VITE_API_URL}/v1`,
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
