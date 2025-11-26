import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Ensures assets are loaded correctly on GitHub Pages
  plugins: [
    react(),
    UnoCSS(),
  ],
})
