import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { host: true },
  preview: { host: true },
  build: {
    outDir: 'dist',
    target: 'es2020',
    // Phaser là một khối lớn; tách riêng để cache lâu giữa các lần deploy.
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: { phaser: ['phaser'], react: ['react', 'react-dom'] },
      },
    },
  },
});
