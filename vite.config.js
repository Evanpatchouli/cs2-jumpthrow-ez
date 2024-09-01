import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import appConfig from './app.config.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: "./monitor",
  base: "./",
  build: {
    outDir: path.resolve(__dirname, './server/public'),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: appConfig.serverPath(),
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/socketio': {
        target: appConfig.socketioPath(),
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/socketio/, '')
      }
    }
  }
})
