import { useEffect, useRef, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { Globe, ChevronDown } from './Icons'

export default function LanguageSelector({ className = '' }) {
  const { lang, setLang, languages, t } = useSettings()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const current = languages.find((l) => l.code === lang) ?? languages[0]

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-earth-200 bg-white px-3 text-sm font-semibold text-forest-700 transition-colors hover:bg-earth-100 dark:border-forest-700 dark:bg-forest-900 dark:text-forest-100 dark:hover:bg-forest-800"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('nav.language')}
      >
        <Globe className="h-4 w-4 shrink-0" />
        <span>{current.short}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 min-w-[10rem] overflow-hidden rounded-2xl border border-earth-100 bg-white py-1 shadow-xl dark:border-forest-700 dark:bg-forest-900"
        >
          {languages.map((l) => (
            <li key={l.code} role="option" aria-selected={lang === l.code}>
              <button
                type="button"
                onClick={() => {
                  setLang(l.code)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  lang === l.code
                    ? 'bg-forest-50 font-semibold text-forest-800 dark:bg-forest-800 dark:text-gold-300'
                    : 'text-forest-700 hover:bg-earth-50 dark:text-forest-100 dark:hover:bg-forest-800'
                }`}
              >
                <span>{l.label}</span>
                <span className="text-xs uppercase text-earth-500 dark:text-forest-400">{l.short}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
