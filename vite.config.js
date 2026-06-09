import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
  },
  server: {
    host: true,
    port: 3000,
  },
});
