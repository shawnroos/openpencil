import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    ...devices['Desktop Chrome'],
    launchOptions: {
      args: [
        '--autoplay-policy=no-user-gesture-required',
        '--enable-precise-memory-info',
        '--headless=new',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--use-angle=swiftshader',
        '--disable-background-timer-throttling',
        '--disable-features=AudioServiceOutOfProcess',
        '--disable-renderer-backgrounding',
      ],
    },
  },
  webServer: {
    command: 'bun --bun run dev',
    port: 3000,
    timeout: 30_000,
    reuseExistingServer: true,
  },
})
