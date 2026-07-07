import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './config/env' // validate environment before anything renders (fail fast)
import './index.css'
import { router } from './router'
import { queryClient } from './lib/api/query-client'
import { Toaster } from './components/custom-components/toaster'
import { warmUpServer } from './lib/api/warm-up-server'

// Fire-and-forget: wakes a sleeping Render instance as early as possible so
// it's ready by the time the user submits login/signup. Must never block
// first paint, so it's not awaited.
void warmUpServer()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
)
