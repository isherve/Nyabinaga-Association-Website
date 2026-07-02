import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { featuredImages } from '../content/site'
import { tp } from '../content/groupTranslations'
import { useSettings } from '../context/SettingsContext'
import { ArrowRight, Check } from '../components/Icons'

export default function About() {
  const { t, lang } = useSettings()

  const timeline = [
    { date: tp('November 1, 2011', lang), title: t('about.timeline.start.title'), text: t('about.timeline.start.text') },
    { date: tp('November 19, 2011', lang), title: t('about.timeline.activity.title'), text: t('about.timeline.activity.text') },
    { date: t('about.timeline.today.date'), title: t('about.timeline.today.title'), text: t('about.timeline.today.text') },
  ]

  const staffRoles = [
    { role: t('about.staff.daily'), number: 5 },
    { role: t('about.staff.teachers'), number: 4 },
    { role: t('about.staff.cooks'), number: 4 },
    { role: t('about.staff.facilities'), number: 1 },
    { role: t('about.staff.project'), number: 5 },
    { role: t('about.staff.parents'), number: 5 },
    { role: t('about.staff.youth'), number: 8 },
  ]

  const facilities = [t('about.facilities.f1'), t('about.facilities.f2')]

  return (
    <>
      <PageHeader
        eyebrow={t('about.eyebrow')}
        title={t('about.title')}
        subtitle={t('about.subtitle')}
        image={featuredImages.about}
      />

      <section className="section">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">{t('about.origins.eyebrow')}</span>
            <h2 className="mt-3 text-3xl font-bold text-forest-900 dark:text-forest-50">{t('about.origins.title')}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">{t('about.origins.p1')}</p>
            <p className="mt-4 text-lg leading-relaxed text-muted">{t('about.origins.p2')}</p>
          </Reveal>
          <Reveal delay={120} className="overflow-hidden rounded-3xl shadow-lg">
            <img src="/images/image6.jpeg" alt={t('about.title')} className="h-full w-full object-cover" loading="lazy" />
          </Reveal>
        </div>
      </section>

      <section className="section surface-muted">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">{t('about.location.eyebrow')}</span>
            <h2 className="mt-3 text-3xl font-bold text-forest-900 dark:text-forest-50">{t('about.location.title')}</h2>
            <p className="mt-4 text-lg text-muted">{t('about.location.text')}</p>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {timeline.map((item, i) => (
              <Reveal key={i} delay={i * 100} className="card p-7">
                <span className="inline-block rounded-full bg-gold-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-700 dark:bg-gold-900/40 dark:text-gold-300">
                  {item.date}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-forest-900 dark:text-forest-50">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <Reveal delay={120} className="order-2 overflow-hidden rounded-3xl shadow-lg lg:order-1">
            <img src="/images/image25.jpeg" alt="" className="h-full w-full object-cover" loading="lazy" />
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <span className="eyebrow">{t('about.facilities.eyebrow')}</span>
            <h2 className="mt-3 text-3xl font-bold text-forest-900 dark:text-forest-50">{t('about.facilities.title')}</h2>
            <ul className="mt-6 space-y-4">
              {facilities.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-lg leading-relaxed text-muted">{f}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-2xl bg-forest-50 p-5 text-muted dark:bg-forest-900">{t('about.facilities.saturday')}</p>
          </Reveal>
        </div>
      </section>

      <section className="section bg-forest-900 text-forest-50 dark:bg-forest-950">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-gold-400/20 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-gold-200">
              {t('about.people.eyebrow')}
            </span>
            <h2 className="mt-3 text-3xl font-bold text-white">{t('about.people.title')}</h2>
            <p className="mt-4 text-lg text-forest-100/80">{t('about.people.sub')}</p>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {staffRoles.map((role, i) => (
              <Reveal key={role.role} delay={i * 70} className="flex items-center gap-4 rounded-2xl bg-forest-800/60 p-5 dark:bg-forest-900/80">
                <span className="font-display text-3xl font-extrabold text-gold-300">{role.number}</span>
                <span className="text-sm font-medium text-forest-50/90">{role.role}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-earth-100 p-10 text-center dark:bg-forest-900 sm:flex-row sm:text-left">
            <div>
              <h2 className="text-2xl font-bold text-forest-900 dark:text-forest-50">{t('about.cta.title')}</h2>
              <p className="mt-2 text-muted">{t('about.cta.sub')}</p>
            </div>
            <Link to="/groups" className="btn-primary whitespace-nowrap">
              {t('about.cta.button')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
