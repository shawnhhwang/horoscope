import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'vendor-three';
          if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) return 'vendor-motion';
          if (id.includes('node_modules/marked') || id.includes('node_modules/dompurify')) return 'vendor-markdown';
          if (id.includes('node_modules/vue') || id.includes('node_modules/pinia') || id.includes('node_modules/vue-router')) return 'vendor-vue';
          if (id.includes('packages/astro-core')) return 'celestial-astro-core';
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5499,
    proxy: {
      '/api': {
        target: 'http://localhost:5498',
        changeOrigin: true,
      },
    },
  },
});
