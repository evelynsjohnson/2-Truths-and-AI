import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cloudflare({
      configPath: './wrangler.json',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/react-app'),
      '/assets': path.resolve(__dirname, './src/react-app/assets'),
    },
  },
  root: './',
  publicDir: false, // Assets are handled via alias
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    ssr: 'src/worker/index.js', // Specify the SSR entry point for Cloudflare Worker
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from src/react-app/assets
      allow: ['..'],
    },
  },
});
