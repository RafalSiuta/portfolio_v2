import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
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
})
