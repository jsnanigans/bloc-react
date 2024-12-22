import { defineConfig } from 'vite';
import * as path from 'jsr:@std/path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest-setup.ts',
  },
  resolve: {
    alias: {
      '@blac/react': path.resolve(__dirname, 'src'),
      '@blac/core': path.resolve(__dirname, '../core', 'src'),
      'npm:react': path.resolve(__dirname, '../node_modules/react'),
    },
  },
});
