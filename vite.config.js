import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/SENTINEL/', // Replace 'SENTINEL' with your actual repo name
})
