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
  server: {
    host: '0.0.0.0', // 允許所有 IP 訪問
    port: 5499,
    proxy: {
      '/api': {
        target: 'http://localhost:5498',
        changeOrigin: true,
      },
    },
  },
});
