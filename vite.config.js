import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all /api/* requests to BioMini SDK
      '/api': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Fix request path and headers
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
            console.log('Proxying request:', req.method, req.url, 'to', proxyReq.path);
          });

          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173';
            proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = '*';
            console.log('Proxy response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  preview: {
    host: true,
    allowedHosts: ['uat.lms.onefin.app', 'lms.onefin.app'],
  },
});

