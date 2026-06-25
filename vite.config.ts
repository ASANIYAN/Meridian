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
  build: {
    // The editor chunk (Tiptap + ProseMirror) is large but lazy — loaded only
    // when a document is opened, never in the initial app bundle.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split the framework baseline into cacheable vendor chunks so the app
        // chunk stays lean (the document/editor route is lazy-loaded separately).
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id))
            return 'react'
          if (id.includes('@tanstack')) return 'query'
          if (
            id.includes('react-hook-form') ||
            id.includes('@hookform') ||
            /[\\/]node_modules[\\/]zod[\\/]/.test(id)
          )
            return 'forms'
          // Editor stack — loaded with the lazy document route, kept off the rest.
          if (id.includes('@tiptap') || id.includes('prosemirror')) return 'editor'
          if (/[\\/]node_modules[\\/](yjs|y-protocols|lib0)[\\/]/.test(id)) return 'yjs'
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
