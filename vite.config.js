import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Simple proxy configuration - only what's needed
      '/api': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        // No need for a rewrite that doesn't change anything
        secure: false,
        configure: (proxy, _options) => {
          // Basic logging for debugging
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log(`Proxy: ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
            // Essential CORS headers
            proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173';
            proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
          });
        }
      }
    }
  }
});

