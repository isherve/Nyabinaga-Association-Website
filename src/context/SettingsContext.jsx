import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from '../content/translations'

const THEME_KEY = 'nyabinaga_theme'
const LANG_KEY = 'nyabinaga_lang'

const SettingsContext = createContext(null)

function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

export function SettingsProvider({ children }) {
  const [theme, setThemeState] = useState('light')
  const [lang, setLangState] = useState('en')

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY)
      const savedLang = localStorage.getItem(LANG_KEY)
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setThemeState(savedTheme)
        applyTheme(savedTheme)
      }
      if (savedLang && translations[savedLang]) {
        setLangState(savedLang)
        document.documentElement.lang = savedLang === 'rw' ? 'rw' : savedLang
      }
    } catch {
      /* ignore */
    }
  }, [])

  const setTheme = useCallback((next) => {
    setThemeState(next)
    applyTheme(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const setLang = useCallback((code) => {
    if (!translations[code]) return
    setLangState(code)
    document.documentElement.lang = code === 'rw' ? 'rw' : code
    try {
      localStorage.setItem(LANG_KEY, code)
    } catch {
      /* ignore */
    }
  }, [])

  const t = useCallback(
    (key) => translations[lang]?.[key] ?? translations.en[key] ?? key,
    [lang],
  )

  const value = useMemo(
    () => ({
      theme,
      lang,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
      setLang,
      t,
      languages: [
        { code: 'en', label: 'English', short: 'EN' },
        { code: 'fr', label: 'Français', short: 'FR' },
        { code: 'rw', label: 'Kinyarwanda', short: 'RW' },
      ],
    }),
    [theme, lang, setTheme, toggleTheme, setLang, t],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider')
  return ctx
}
