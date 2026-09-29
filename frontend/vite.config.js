import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// /api requests go to the backend (run it with `npm run dev` in ../backend)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
