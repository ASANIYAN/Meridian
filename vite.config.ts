/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // No dev proxy: apiClient calls VITE_API_URL directly (src/lib/api/client.ts)
  // so the app behaves the same in dev and in production (Vercel). Requires
  // the backend to allow the dev origin via CORS.
  // 'es' (not the default 'iife') so the PDF-export worker (pdf.worker.ts) can
  // use plain ESM imports from node_modules (@react-pdf/renderer, react).
  worker: {
    format: 'es',
  },
  // Dev-only: force @react-pdf/renderer into the dependency pre-bundle up
  // front. Otherwise Vite only discovers it the first time the PDF worker
  // actually imports it, mid-generation, and that on-demand
  // optimize+reload can race with (and kill) the worker's first run.
  optimizeDeps: {
    include: ['@react-pdf/renderer'],
  },
  build: {
    rollupOptions: {
      output: {
        // Split the framework baseline into cacheable vendor chunks so the app
        // chunk stays lean (the document/editor route is lazy-loaded separately).
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (
            /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(
              id,
            )
          )
            return 'react'
          if (id.includes('@tanstack')) return 'query'
          if (
            id.includes('react-hook-form') ||
            id.includes('@hookform') ||
            /[\\/]node_modules[\\/]zod[\\/]/.test(id)
          )
            return 'forms'
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
