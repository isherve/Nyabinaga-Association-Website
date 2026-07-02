import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On GitHub Pages the site is served from a repo subpath
// (https://isherve.github.io/Nyabinaga-Association-Website/), so the
// production build needs that base. Local dev stays at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Nyabinaga-Association-Website/' : '/',
  plugins: [react()],
  server: {
    port: 8080,
  },
}))
