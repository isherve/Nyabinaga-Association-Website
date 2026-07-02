import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Scroll to the top of the page on every route change.
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}
