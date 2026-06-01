import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      '/uploads': {
        target: (process.env.VITE_API_URL || 'http://localhost:8000').replace('/api', ''),
        changeOrigin: true,
        secure: false,
      }
    }
  }
})