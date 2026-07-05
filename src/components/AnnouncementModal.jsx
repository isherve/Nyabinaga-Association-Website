import { useCallback, useEffect, useState } from 'react'
import { site } from '../content/site'
import { useSettings } from '../context/SettingsContext'
import { Close, Check, Megaphone } from './Icons'

const DISMISSED_KEY = 'nyabinaga_announcements_dismissed_v1'

function getDismissed() {
  try {
    const raw = sessionStorage.getItem(DISMISSED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function dismissId(id) {
  try {
    const ids = [...new Set([...getDismissed(), id])]
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(ids))
  } catch {
    /* ignore */
  }
}

const fmtDate = (d) => {
  try {
    return new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return d
  }
}

export default function AnnouncementModal({ announcements }) {
  const { t } = useSettings()
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(() => getDismissed())

  const pending = announcements.filter((a) => !dismissed.includes(a.id))
  const current = pending[0]

  const handleClose = useCallback(() => {
    if (!current) return
    dismissId(current.id)
    const nextDismissed = getDismissed()
    setDismissed(nextDismissed)
    const remaining = announcements.filter((a) => !nextDismissed.includes(a.id))
    if (remaining.length === 0) setOpen(false)
  }, [announcements, current])

  useEffect(() => {
    if (announcements.some((a) => !getDismissed().includes(a.id))) setOpen(true)
  }, [announcements])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, handleClose])

  if (!open || !current) return null

  const hasMore = pending.length > 1

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[120] flex items-center justify-center bg-forest-950/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-forest-900 shadow-2xl ring-1 ring-white/10">
        {/* Site header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 bg-white px-4 py-3 dark:bg-forest-950">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/images/logo.png" alt="" className="h-10 w-10 shrink-0 rounded-full bg-white object-contain ring-2 ring-gold-400/50" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-wide text-forest-800 dark:text-forest-100">{site.name}</p>
              <p className="truncate text-[10px] text-earth-600 dark:text-forest-400">{t('home.announcements.office')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded-lg p-1.5 text-earth-500 hover:bg-earth-100 dark:text-forest-300 dark:hover:bg-forest-800"
            aria-label={t('home.announcements.close')}
          >
            <Close className="h-5 w-5" />
          </button>
        </div>

        {/* Notice bar */}
        <div className="flex items-center gap-2 bg-forest-700 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white">
          <Megaphone className="h-4 w-4 shrink-0 text-gold-300" />
          <span className="truncate">{t('home.announcements.notice')}: {current.title}</span>
        </div>

        {/* Portrait document viewer */}
        <div className="flex flex-1 flex-col overflow-hidden bg-forest-800/80 p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-forest-200/80">
            <span className="inline-flex items-center gap-1.5">
              <span className="rounded bg-white/10 px-2 py-0.5">{t('home.announcements.official')}</span>
            </span>
            <span className="rounded bg-gold-500/90 px-2 py-0.5 text-[10px] font-bold uppercase text-forest-950">
              {t('home.announcements.pinnedLabel')}
            </span>
          </div>

          <div className="mx-auto w-full max-w-[22rem] flex-1 overflow-hidden rounded-lg bg-white shadow-lg">
            <div className="max-h-[min(52vh,28rem)] overflow-y-auto px-6 py-8 text-forest-900">
              <p className="text-right text-xs text-earth-500">{fmtDate(current.date)}</p>
              <h2 id="announcement-title" className="mt-4 text-center font-display text-lg font-bold uppercase leading-snug text-forest-900">
                {current.title}
              </h2>
              {current.author && (
                <p className="mt-2 text-center text-xs font-semibold text-earth-600">{current.author}</p>
              )}
              <div className="my-4 h-px bg-earth-200" />
              {current.body ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-forest-800">{current.body}</p>
              ) : (
                <p className="text-center text-sm italic text-earth-400">—</p>
              )}
            </div>
          </div>

          {pending.length > 1 && (
            <p className="mt-3 text-center text-xs text-forest-200/70">
              1 / {pending.length}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-forest-900 px-4 py-3">
          <p className="min-w-0 truncate text-xs text-forest-200/80">
            {current.title} · {fmtDate(current.date)}
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700"
          >
            <Check className="h-4 w-4" />
            {hasMore ? t('home.announcements.next') : t('home.announcements.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
