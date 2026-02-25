import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    fs: {
      strict: true,
      allow: [__dirname],
    },
    watch: {
      ignored: ['**/web/**', '**/src-tauri/**'],
    },
  },
})
