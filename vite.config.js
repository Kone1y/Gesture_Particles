import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
  },
  server: {
    host: true,
    port: 3000,
  },
});
