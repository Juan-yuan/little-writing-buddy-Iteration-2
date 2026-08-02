import react from '@vitejs/plugin-react'
import type { Connect, Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

const statusPages: Record<string, number> = {
  '/http/404': 404,
  '/http/500': 500,
  '/http/502': 502,
}

/**
 * Dev/preview endpoints that return real HTTP status codes, then send the
 * visitor to the matching safe React error page (no stack traces).
 */
function httpStatusDemo(): Plugin {
  function attach(middlewares: Connect.Server) {
    middlewares.use((req, res, next) => {
      const path = req.url?.split('?')[0] ?? ''
      const code = statusPages[path]
      if (!code) {
        next()
        return
      }

      res.statusCode = code
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      res.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0;url=/${code}" />
    <title>${code}</title>
  </head>
  <body>
    <p>HTTP ${code}. Redirecting to the safe error page…</p>
    <p><a href="/${code}">Continue</a></p>
  </body>
</html>`)
    })
  }

  return {
    name: 'http-status-demo',
    configureServer(server) {
      attach(server.middlewares)
    },
    configurePreviewServer(server) {
      attach(server.middlewares)
    },
  }
}

export default defineConfig({
  plugins: [react(), httpStatusDemo()],
  test: {
    name: 'little-writing-buddy',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    passWithNoTests: true,
    css: true,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/main.tsx',
        'src/**/*.d.ts',
        'src/content/**',
        'src/types/**',
        // Bootstrapping / type-only shells — not meaningful unit-test targets
        'src/auth/types.ts',
        'src/auth/authContextValue.ts',
        // Canvas pointer/resize UI and pixel-based scoring — hard to unit-test in jsdom
        'src/components/TracingCanvas.tsx',
        'src/utils/tracingAccuracy.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 70,
      },
    },
  },
})
