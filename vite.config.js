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
  }
})
