import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    host: true,
  },
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1600,
  },
});
