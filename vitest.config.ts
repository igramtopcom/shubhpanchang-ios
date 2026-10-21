// Pure logic only (src/lib): no React Native, no native modules.
// tsconfigRaw keeps esbuild from reading tsconfig.json, whose
// "extends": "expo/tsconfig.base" Vite's resolver cannot follow; the logic
// files need no project-specific compiler options.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: { tsconfigRaw: '{}' },
  test: { include: ['tests/**/*.test.ts'] },
})
