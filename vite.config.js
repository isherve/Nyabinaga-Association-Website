import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves from a repo subpath; Vercel serves from the root.
export default defineConfig(({ command }) => {
  const onVercel = process.env.VERCEL === '1'
  const onGhPages = command === 'build' && !onVercel

  return {
    base: onGhPages ? '/Nyabinaga-Association-Website/' : '/',
    plugins: [react()],
    server: {
      port: 8080,
    },
  }
})
