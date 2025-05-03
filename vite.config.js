import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false,
        ws: true,
        xfwd: true,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Remove origin and referer headers
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');

            console.log('Sending Request:', req.method, req.url);
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Set proper CORS headers
            proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173';
            proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,HEAD,PUT,PATCH,POST,DELETE';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept';

            console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
});
