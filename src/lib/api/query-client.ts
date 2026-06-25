import { QueryCache, QueryClient } from '@tanstack/react-query'
import { useToastStore } from '@/store/toast-store'
import { getApiErrorMessage } from './get-api-error-message'

/**
 * One QueryClient for the app. Failed *queries* (reads) surface a toast with a
 * readable message via the REST error utility (FE-ERR-1). Mutation errors are
 * left to the forms, which surface field-level errors where the backend provides
 * them and fall back to a toast otherwise.
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      useToastStore.getState().addToast({
        message: getApiErrorMessage(error),
        variant: 'error',
      })
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})
