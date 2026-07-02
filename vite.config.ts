import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://v2.tauri.app/start/frontend/vite/
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    outDir: 'dist',
  },
});
