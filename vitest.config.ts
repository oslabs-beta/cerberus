import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target:
          process.env.RUNNING_IN_DOCKER === 'true'
            ? 'http://server:3000'
            : 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8', // Note: 'c8' is deprecated in newer versions, use 'v8' instead
      reporter: ['text', 'json', 'html'],
      // Threshold settings go inside the 'thresholds' property
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    setupFiles: ['./server/src/tests/setup.ts'],
  },
});
