import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // căi relative, ca aplicația să funcționeze pe GitHub Pages indiferent de numele repo-ului
  base: './',
  plugins: [react()],
})
