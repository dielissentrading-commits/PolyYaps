import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Both servers listen on the network so the app can be opened on a phone on
  // the same wifi, which is the device it is designed for.
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
});
