/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dev proxy target — the REST API origin (default port 8000, CLAUDE.md §2).
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), 'VITE_')
const apiTarget = env.VITE_API_URL || 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Proxy /v1 to the API so requests are same-origin and never hit CORS.
    // In production the same path is served behind nginx (FE-SETUP-7).
    proxy: {
      '/v1': { target: apiTarget, changeOrigin: true },
    },
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
