import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { featuredImages } from '../content/site'
import { leadership, staffRoles } from '../content/staff'
import { useSettings } from '../context/SettingsContext'
import { Users } from '../components/Icons'

function initials(name, role) {
  const source = name.trim() || role
  return source
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

function TeamPhoto({ leader, size = 'md', t }) {
  const hasName = Boolean(leader.name?.trim())
  const hasPhoto = Boolean(leader.photo?.trim())
  const sizeCls = size === 'lg' ? 'h-44 w-44 sm:h-52 sm:w-52' : 'h-36 w-36'

  return (
    <div
      className={`relative mx-auto shrink-0 overflow-hidden rounded-full bg-earth-100 shadow-lg ring-4 ring-white dark:bg-forest-800 dark:ring-forest-700 ${sizeCls}`}
    >
      {hasPhoto ? (
        <img
          src={leader.photo}
          alt={hasName ? leader.name : leader.role}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-forest-700 to-forest-900 px-3 text-center">
          <span className="font-display text-3xl font-bold text-white/90">{initials(leader.name, leader.role)}</span>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-gold-300/80">{t('team.photoPending')}</p>
        </div>
      )}
    </div>
  )
}

export default function Team() {
  const { t } = useSettings()
  const [director, ...management] = leadership

  return (
    <>
      <PageHeader
        eyebrow={t('team.eyebrow')}
        title={t('team.title')}
        subtitle={t('team.subtitle')}
        image={featuredImages.about}
      />

      {/* Featured director — UTB-style leadership spotlight */}
      <section className="section">
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
                  <TeamPhoto leader={director} size="lg" t={t} />
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-full bg-forest-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest-700 dark:bg-forest-800 dark:text-gold-300">
                      {t('team.director.eyebrow')}
                    </span>
                    <h3 className="mt-4 font-display text-2xl font-bold text-forest-900 dark:text-forest-50 sm:text-3xl">
                      {director.name || t('team.namePending')}
                    </h3>
                    <p className="mt-2 text-lg font-semibold text-forest-600 dark:text-gold-400">{director.role}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          )}
        </div>
      </section>

      {/* Management team — uniform circular photos, same size for everyone */}
      {management.length > 0 && (
        <section className="section bg-earth-100/60 dark:bg-forest-900/40">
          <div className="container-page">
            <div className="mb-10 rounded-2xl bg-forest-800 px-6 py-4 text-center dark:bg-forest-950">
              <h2 className="font-display text-lg font-bold uppercase tracking-widest text-white">
                {t('team.management.title')}
              </h2>
            </div>
            <Reveal>
              <p className="mx-auto max-w-2xl text-center text-muted">{t('team.management.sub')}</p>
            </Reveal>

            <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {management.map((leader, i) => (
                <Reveal key={leader.name || leader.role} delay={(i % 4) * 70}>
                  <article className="flex flex-col items-center text-center">
                    <TeamPhoto leader={leader} t={t} />
                    <h3 className="mt-5 font-display text-lg font-bold text-forest-900 dark:text-forest-50">
                      {leader.name || t('team.namePending')}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-forest-600 dark:text-gold-400">{leader.role}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Committees & volunteers */}
      <section className="section">
        <div className="container-page">
          <Reveal>
            <span className="eyebrow">{t('team.structure.eyebrow')}</span>
            <h2 className="mt-3 text-3xl font-bold text-forest-900 dark:text-forest-50">
              {t('team.structure.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-muted">{t('team.structure.sub')}</p>
          </Reveal>

          <div className="mt-10 flex flex-wrap gap-3">
            {staffRoles.map((item, i) => (
              <Reveal key={item.role} delay={i * 40}>
                <span className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white px-4 py-2.5 text-sm font-medium text-forest-800 shadow-sm dark:border-forest-700 dark:bg-forest-900 dark:text-forest-100">
                  <Users className="h-4 w-4 shrink-0 text-forest-500 dark:text-gold-400" />
                  <span>{item.role}</span>
                  <span className="shrink-0 rounded-full bg-forest-100 px-1.5 py-0.5 text-xs font-bold tabular-nums text-forest-700 dark:bg-forest-800 dark:text-gold-300">
                    {item.number}
                  </span>
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
