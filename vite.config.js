import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://dncalliance-api.onrender.com',
        changeOrigin: true,
        secure: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})