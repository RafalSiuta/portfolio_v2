import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react(),
    svgr({
      include: '**/*.svg',
      exportAsDefault: true,
      svgrOptions: {
        icon: true,
        svgProps: { role: 'img', focusable: 'false' },
      },
    }),
  ],
  server: {
    proxy: {
      '/api/contact': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
