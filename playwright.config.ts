import { defineConfig, devices } from '@playwright/test'

const PORT = 5174

/**
 * E2E smoke config (FE-POLISH-4). Boots the Vite dev server and runs the smoke
 * spec against it; all backend calls are mocked in-test (page.route), so no real
 * API/WS is needed. VITE_* are provided here so the app's env validation
 * (src/config/env.ts) passes in CI where there's no .env.local — the values are
 * irrelevant since requests are intercepted.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_API_URL: 'http://localhost:8000',
      VITE_WS_URL: 'ws://localhost:8001',
    },
  },
})
