// Pure logic only (src/lib): no React Native, no native modules.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: { include: ['tests/**/*.test.ts'] },
})
