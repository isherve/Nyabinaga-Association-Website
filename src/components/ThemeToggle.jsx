import { useSettings } from '../context/SettingsContext'
import { Sun, Moon } from './Icons'

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme, t } = useSettings()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-earth-200 bg-white text-forest-700 transition-colors hover:bg-earth-100 dark:border-forest-700 dark:bg-forest-900 dark:text-gold-300 dark:hover:bg-forest-800 ${className}`}
      aria-label={isDark ? t('nav.themeLight') : t('nav.themeDark')}
      title={isDark ? t('nav.themeLight') : t('nav.themeDark')}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
