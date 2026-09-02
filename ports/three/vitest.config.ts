import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      'thinking-orbs/engine': path.resolve(__dirname, '../../src/engine/index.ts')
    }
  },
  test: { environment: 'node' }
});
