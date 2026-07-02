import { useEffect, useState } from 'react'
import { heroSlideshow } from '../content/site'

// Auto-advancing background slideshow. Each image slides in from the left and
// exits to the right (left -> right motion), with a soft crossfade.
export default function HeroSlideshow({ interval = 5000 }) {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState(null)

  useEffect(() => {
    if (heroSlideshow.length <= 1) return
    const id = setInterval(() => {
      setCurrent((c) => {
        setPrev(c)
        return (c + 1) % heroSlideshow.length
      })
    }, interval)
    return () => clearInterval(id)
  }, [interval])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {heroSlideshow.map((src, i) => {
        // current: in view; prev: sliding out to the right; others: waiting on the left.
        let position = '-translate-x-full opacity-0'
        if (i === current) position = 'translate-x-0 opacity-100'
        else if (i === prev) position = 'translate-x-full opacity-0'

        return (
          <div
            key={src}
            className={`absolute inset-0 transform transition-all duration-[1200ms] ease-in-out ${position}`}
            aria-hidden="true"
          >
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        )
      })}

      {/* Readability overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-forest-900/95 via-forest-900/80 to-forest-800/40" />
    </div>
  )
}
