import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    host: '::',
    port: 5173,
    hmr: process.env.DISABLE_HMR !== 'true',
    fs: {
      allow: ['.', '../shared'],
      deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/landing': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist/spa',
  },
});
