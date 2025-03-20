import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 5173,
    strictPort: true,
    // Add allowedHosts to fix the blocked request error
    allowedHosts: [
      'localhost',
      'dncalliance.onrender.com',
      'thedncalliance.com',
      'www.thedncalliance.com',
      '.onrender.com'
    ]
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 5173,
    strictPort: true,
    // Also add allowedHosts to preview server
    allowedHosts: [
      'localhost',
      'dncalliance.onrender.com',
      'thedncalliance.com',
      'www.thedncalliance.com',
      '.onrender.com'
    ]
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
})