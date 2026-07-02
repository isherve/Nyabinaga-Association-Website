import { useEffect, useRef, useState } from 'react'

// Formats a large number compactly (e.g. 72,826,010 -> "72.8M").
function compactFormat(value) {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K'
  return new Intl.NumberFormat('en-US').format(value)
}

// Counts up to `value` when scrolled into view.
export default function AnimatedNumber({ value, suffix = '', compact = false, duration = 1400 }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true
            const start = performance.now()
            const step = (now) => {
              const progress = Math.min((now - start) / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 3)
              setDisplay(Math.round(value * eased))
              if (progress < 1) requestAnimationFrame(step)
            }
            requestAnimationFrame(step)
          }
        })
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration])

  const formatted = compact
    ? compactFormat(display)
    : new Intl.NumberFormat('en-US').format(display)

  return (
    <span ref={ref}>
      {formatted}
      {suffix}
    </span>
  )
}
