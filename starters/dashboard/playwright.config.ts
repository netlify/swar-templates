import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:4403',
    browserName: 'chromium',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4403 --strictPort',
    url: 'http://127.0.0.1:4403',
    reuseExistingServer: false,
  },
})
