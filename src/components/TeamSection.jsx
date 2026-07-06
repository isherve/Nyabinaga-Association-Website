import { useEffect, useState } from 'react'
import Reveal from './Reveal'
import { leadership, staffRoles } from '../content/staff'
import { useSettings } from '../context/SettingsContext'
import { formatPersonName } from '../lib/formatPersonName'
import { Close, Info, Users } from './Icons'

function TeamPhoto({ leader, className = 'h-36 w-36' }) {
  const hasPhoto = Boolean(leader.photo?.trim())

  return (
    <div
      className={`relative mx-auto shrink-0 overflow-hidden rounded-full bg-earth-100 shadow-md ring-4 ring-white dark:bg-forest-800 dark:ring-forest-700 ${className}`}
    >
      {hasPhoto ? (
        <img
          src={leader.photo}
          alt={formatPersonName(leader.name)}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-forest-700 to-forest-900 font-display text-3xl font-bold text-white/90">
          {leader.name?.charAt(0) || '?'}
        </div>
      )}
    </div>
  )
}

export default function TeamSection() {
  const { t } = useSettings()
  const [detail, setDetail] = useState(null)
  const [director, ...management] = leadership

  useEffect(() => {
    if (!detail) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setDetail(null)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [detail])

  const openDetail = (leader) => setDetail(leader)

  return (
    <section id="team" className="section scroll-mt-24 bg-earth-100/50 dark:bg-forest-900/30">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{t('team.leadership.eyebrow')}</span>
          <h2 className="mt-3 text-3xl font-bold text-forest-900 dark:text-forest-50 sm:text-4xl">
            {t('team.leadership.title')}
          </h2>
          <p className="mt-4 text-muted">{t('team.leadership.sub')}</p>
        </Reveal>

        {director && (
          <Reveal className="mt-12">
            <article className="card mx-auto max-w-4xl overflow-hidden">
              <div className="flex flex-col items-center gap-8 p-8 text-center sm:flex-row sm:p-10 sm:text-left">
                <TeamPhoto leader={director} className="h-44 w-44 sm:h-48 sm:w-48" />
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-full bg-forest-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest-700 dark:bg-forest-800 dark:text-gold-300">
                    {t('team.director.eyebrow')}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-bold tracking-wide text-forest-900 dark:text-forest-50 sm:text-3xl">
                    {formatPersonName(director.name)}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <p className="text-lg font-semibold text-forest-600 dark:text-gold-400">{director.role}</p>
                    {director.bio && (
                      <button
                        type="button"
                        onClick={() => openDetail(director)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-forest-600 text-white transition-colors hover:bg-forest-700 dark:bg-forest-500 dark:hover:bg-forest-400"
                        aria-label={t('team.viewDetails')}
                        title={t('team.viewDetails')}
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        )}

        {management.length > 0 && (
          <>
            <div className="mb-8 mt-14 rounded-2xl bg-forest-800 px-6 py-3.5 text-center dark:bg-forest-950">
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white sm:text-base">
                {t('team.management.title')}
              </h3>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {management.map((leader, i) => (
                <Reveal key={leader.name} delay={(i % 4) * 70}>
                  <article className="card flex h-full flex-col items-center p-6 text-center">
                    <TeamPhoto leader={leader} />
                    <h3 className="mt-5 font-display text-base font-bold tracking-wide text-forest-900 dark:text-forest-50">
                      {formatPersonName(leader.name)}
                    </h3>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <p className="text-sm font-semibold text-forest-600 dark:text-gold-400">{leader.role}</p>
                      {leader.bio && (
                        <button
                          type="button"
                          onClick={() => openDetail(leader)}
                          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-700 transition-colors hover:bg-forest-600 hover:text-white dark:bg-forest-800 dark:text-gold-300 dark:hover:bg-forest-500"
                          aria-label={t('team.viewDetails')}
                          title={t('team.viewDetails')}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </>
        )}

        <Reveal className="mt-16">
          <span className="eyebrow">{t('team.structure.eyebrow')}</span>
          <h3 className="mt-3 text-2xl font-bold text-forest-900 dark:text-forest-50">{t('team.structure.title')}</h3>
          <p className="mt-3 max-w-2xl text-muted">{t('team.structure.sub')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {staffRoles.map((item) => (
              <span
                key={item.role}
                className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white px-4 py-2.5 text-sm font-medium text-forest-800 shadow-sm dark:border-forest-700 dark:bg-forest-900 dark:text-forest-100"
              >
                <Users className="h-4 w-4 shrink-0 text-forest-500 dark:text-gold-400" />
                <span>{item.role}</span>
                <span className="shrink-0 rounded-full bg-forest-100 px-1.5 py-0.5 text-xs font-bold tabular-nums text-forest-700 dark:bg-forest-800 dark:text-gold-300">
                  {item.number}
                </span>
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      {detail && (
        <div
          className="animate-fade-in fixed inset-0 z-[110] flex items-center justify-center bg-forest-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="team-detail-title"
          onClick={() => setDetail(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-forest-900 dark:ring-1 dark:ring-forest-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-earth-500 hover:bg-earth-100 dark:text-forest-300 dark:hover:bg-forest-800"
              aria-label={t('auth.close')}
            >
              <Close className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <TeamPhoto leader={detail} className="h-28 w-28" />
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-forest-600 dark:text-gold-400">
                {t('team.roleDetails')}
              </p>
              <h3 id="team-detail-title" className="mt-2 font-display text-xl font-bold tracking-wide text-forest-900 dark:text-forest-50">
                {formatPersonName(detail.name)}
              </h3>
              <p className="mt-1 text-sm font-semibold text-forest-600 dark:text-gold-400">{detail.role}</p>
              {detail.bio && (
                <p className="mt-5 text-left text-sm leading-relaxed text-muted">{detail.bio}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
