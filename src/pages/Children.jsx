import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { featuredImages } from '../content/site'
import { useSettings } from '../context/SettingsContext'
import { Book, Heart, Users, ArrowRight } from '../components/Icons'

export default function Children() {
  const { t } = useSettings()

  const features = [
    { icon: Book, title: t('children.f1.title'), text: t('children.f1.text') },
    { icon: Users, title: t('children.f2.title'), text: t('children.f2.text') },
    { icon: Heart, title: t('children.f3.title'), text: t('children.f3.text') },
  ]

  return (
    <>
      <PageHeader
        eyebrow={t('children.eyebrow')}
        title={t('children.title')}
        subtitle={t('children.subtitle')}
        image={featuredImages.children}
      />

      <section className="section">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <Reveal key={f.title} delay={i * 100} className="card p-8">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold text-forest-900 dark:text-forest-50">{f.title}</h3>
                  <p className="mt-2 text-muted">{f.text}</p>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section surface-muted">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="overflow-hidden rounded-3xl shadow-lg">
            <img src="/images/image22.jpeg" alt="" className="h-full w-full object-cover" loading="lazy" />
          </Reveal>
          <Reveal delay={120}>
            <span className="eyebrow">{t('children.survival.eyebrow')}</span>
            <h2 className="mt-3 text-3xl font-bold text-forest-900 dark:text-forest-50">{t('children.survival.title')}</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">{t('children.survival.text')}</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <Reveal className="mx-auto max-w-3xl rounded-3xl bg-forest-900 p-10 text-center text-forest-50 dark:bg-forest-950 sm:p-14">
            <div className="font-display text-6xl font-extrabold text-gold-300 sm:text-7xl">{t('children.impact.stat')}</div>
            <h2 className="mt-4 text-2xl font-bold text-white">{t('children.impact.title')}</h2>
            <p className="mt-4 text-forest-100/80">{t('children.impact.sub')}</p>
          </Reveal>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-page">
          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-earth-100 p-10 text-center dark:bg-forest-900 sm:flex-row sm:text-left">
            <div>
              <h2 className="text-2xl font-bold text-forest-900 dark:text-forest-50">{t('children.cta.title')}</h2>
              <p className="mt-2 text-muted">{t('children.cta.sub')}</p>
            </div>
            <Link to="/youth" className="btn-primary whitespace-nowrap">
              {t('children.cta.button')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
