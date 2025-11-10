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
    },
  },
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist/client',
    emptyOutDir: false,
    rollupOptions: {
      input: './index.html',
    },
    assetsDir: 'assets',
    copyPublicDir: true,
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
