import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  esbuild: {
    jsxImportSource: 'react'
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      outputmanualChunks: {
        react: ['react', 'react-dom']
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
})