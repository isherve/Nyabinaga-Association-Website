import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { Close, Lock } from './Icons'

export default function PasswordModal({ open, mode = 'details', onClose, onSuccess }) {
  const { unlockDetails, loginAdmin, loginPastors } = useAuth()
  const { t } = useSettings()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef(null)

  const isAdmin = mode === 'admin'
  const isPastors = mode === 'pastors'

  useEffect(() => {
    if (open) {
      setPassword('')
      setError(false)
      const timer = setTimeout(() => inputRef.current?.focus(), 60)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const ok = isAdmin ? loginAdmin(password) : isPastors ? loginPastors(password) : unlockDetails(password)
    if (ok) {
      onSuccess?.()
      onClose()
    } else {
      setError(true)
    }
  }

  const title = isAdmin ? t('auth.adminTitle') : isPastors ? t('auth.pastorsTitle') : t('auth.restricted')
  const subtitle = isAdmin ? t('auth.adminSub') : isPastors ? t('auth.pastorsSub') : t('auth.restrictedSub')
  const submitLabel = isAdmin || isPastors ? t('auth.login') : t('auth.unlock')

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[110] flex items-center justify-center bg-forest-900/80 p-4 dark:bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl dark:bg-forest-900 dark:ring-1 dark:ring-forest-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
            <Lock className="h-6 w-6" />
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-earth-500 hover:bg-earth-100 dark:text-forest-300 dark:hover:bg-forest-800"
            aria-label={t('auth.close')}
          >
            <Close className="h-5 w-5" />
          </button>
        </div>

        <h2 className="mt-4 font-display text-xl font-bold text-forest-900 dark:text-forest-50">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {subtitle}
        </p>

        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="access-password" className="sr-only">
            {t('auth.password')}
          </label>
          <input
            ref={inputRef}
            id="access-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(false)
            }}
            placeholder={t('auth.password')}
            className={`w-full rounded-xl border bg-earth-50 px-4 py-3 text-forest-900 placeholder-earth-400 focus:bg-white focus:outline-none focus:ring-2 dark:bg-forest-800 dark:text-forest-50 dark:placeholder-forest-400 dark:focus:bg-forest-950 ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                : 'border-earth-200 focus:border-forest-500 focus:ring-forest-200 dark:border-forest-700'
            }`}
          />
          {error && (
            <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
              {t('auth.wrongPassword')}
            </p>
          )}
          <button type="submit" className="btn-primary mt-4 w-full">
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  )
}
