import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const scrollToHash = () => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else window.scrollTo({ top: 0, behavior: 'auto' })
      }
      // Allow lazy-loaded About content to mount before scrolling.
      const timer = setTimeout(scrollToHash, 100)
      return () => clearTimeout(timer)
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}
