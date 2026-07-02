import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { featuredImages } from '../content/site'
import { leadership, staffRoles } from '../content/staff'
import { useSettings } from '../context/SettingsContext'
import { Users } from '../components/Icons'

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

export default function Team() {
  const { t } = useSettings()
  const namedLeaders = leadership.filter((l) => l.name.trim())
  const showLeaders = namedLeaders.length > 0

  const totalTeam = staffRoles.reduce((sum, r) => sum + r.number, 0)

  return (
    <>
      <PageHeader
        eyebrow={t('team.eyebrow')}
        title={t('team.title')}
        subtitle={t('team.subtitle')}
        image={featuredImages.about}
      />

      {showLeaders && (
        <section className="section">
          <div className="container-page">
            <Reveal>
              <span className="eyebrow">{t('team.leadership.eyebrow')}</span>
              <h2 className="mt-3 text-3xl font-bold text-forest-900 dark:text-forest-50">
                {t('team.leadership.title')}
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {namedLeaders.map((leader, i) => (
                <Reveal key={leader.name} delay={i * 80}>
                  <div className="card flex flex-col items-center p-7 text-center">
                    {leader.photo ? (
                      <img
                        src={leader.photo}
                        alt={leader.name}
                        className="h-28 w-28 rounded-full object-cover ring-4 ring-forest-100 dark:ring-forest-800"
                      />
                    ) : (
                      <span className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-forest-600 to-forest-800 font-display text-3xl font-bold text-white ring-4 ring-gold-400/30">
                        {initials(leader.name)}
                      </span>
                    )}
                    <h3 className="mt-5 font-display text-lg font-bold text-forest-900 dark:text-forest-50">
                      {leader.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-forest-600 dark:text-gold-400">{leader.role}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={`section ${showLeaders ? 'bg-earth-100/60 dark:bg-forest-900/40' : ''}`}>
        <div className="container-page">
          <Reveal>
            <span className="eyebrow">{t('team.structure.eyebrow')}</span>
            <h2 className="mt-3 text-3xl font-bold text-forest-900 dark:text-forest-50">
              {t('team.structure.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-muted">{t('team.structure.sub')}</p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {staffRoles.map((role, i) => (
              <Reveal key={role.role} delay={i * 60}>
                <div className="card flex items-center gap-4 p-6">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-forest-100 font-display text-xl font-bold text-forest-700 dark:bg-forest-800 dark:text-gold-400">
                    {role.number}
                  </span>
                  <span className="font-medium text-forest-800 dark:text-forest-100">{role.role}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-10 flex items-center gap-4 rounded-3xl bg-forest-600 p-7 text-white dark:bg-forest-700">
              <Users className="h-10 w-10 shrink-0 text-gold-300" />
              <p className="text-lg font-semibold">
                {totalTeam} {t('team.total')}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
