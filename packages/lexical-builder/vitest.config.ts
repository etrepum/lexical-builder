import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@etrepum/lexical-builder': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
