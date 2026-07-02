import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { featuredImages } from '../content/site'
import { useSettings } from '../context/SettingsContext'
import { Tools, Spark, Coins, Check } from '../components/Icons'

export default function Youth() {
  const { t } = useSettings()

  const youthActivities = [t('youth.group.a1'), t('youth.group.a2')]
  const blacksmithItems = [t('youth.blacksmith.i1'), t('youth.blacksmith.i2')]
  const businesses = [
    t('youth.businesses.b1'),
    t('youth.businesses.b2'),
    t('youth.businesses.b3'),
    t('youth.businesses.b4'),
  ]
  const vocational = [
    { name: t('youth.vocational.tailoring'), local: 'Ubudozi' },
    { name: t('youth.vocational.shoemaking'), local: '' },
    { name: t('youth.vocational.carpentry'), local: 'Ububaji' },
    { name: t('youth.vocational.entrepreneurship'), local: 'Ubumenyingiro' },
    { name: t('youth.vocational.weaving'), local: 'Ububoshyi' },
  ]

  return (
    <>
      <PageHeader
        eyebrow={t('youth.eyebrow')}
        title={t('youth.title')}
        subtitle={t('youth.subtitle')}
        image={featuredImages.youth}
      />

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <Reveal className="card p-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
              <Coins className="h-7 w-7" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold text-forest-900 dark:text-forest-50">
              {t('youth.group.title')}
            </h2>
            <p className="mt-2 text-muted">{t('youth.group.desc')}</p>
            <ul className="mt-5 space-y-3">
              {youthActivities.map((a) => (
                <li key={a} className="flex items-start gap-3 text-muted">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
                    <Check className="h-4 w-4" />
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120} className="card p-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-earth-100 text-earth-700 dark:bg-forest-800 dark:text-forest-200">
              <Tools className="h-7 w-7" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold text-forest-900 dark:text-forest-50">
              {t('youth.blacksmith.title')}
            </h2>
            <ul className="mt-5 space-y-3">
              {blacksmithItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-earth-100 text-earth-700 dark:bg-forest-800 dark:text-forest-200">
                    <Check className="h-4 w-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-xl bg-gold-50 px-4 py-3 text-sm font-medium text-gold-800 dark:bg-gold-900/30 dark:text-gold-300">
              {t('youth.blacksmith.note')}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section surface-muted">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="overflow-hidden rounded-3xl shadow-lg">
            <img src="/images/image48.jpeg" alt="" className="h-full w-full object-cover" loading="lazy" />
          </Reveal>
          <Reveal delay={120}>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-100 text-gold-600 dark:bg-gold-900/40 dark:text-gold-400">
              <Spark className="h-7 w-7" />
            </span>
            <h2 className="mt-5 text-3xl font-bold text-forest-900 dark:text-forest-50">{t('youth.talent.title')}</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">{t('youth.talent.desc')}</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">{t('youth.businesses.eyebrow')}</span>
            <h2 className="mt-3 text-3xl font-bold text-forest-900 dark:text-forest-50">{t('youth.businesses.title')}</h2>
            <p className="mt-4 text-lg text-muted">{t('youth.businesses.sub')}</p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {businesses.map((b, i) => (
              <Reveal key={b} delay={i * 80} className="card p-6 text-center transition-transform hover:-translate-y-1">
                <span className="font-medium text-forest-800 dark:text-forest-100">{b}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-forest-900 text-forest-50 dark:bg-forest-950">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-gold-400/20 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-gold-200">
              {t('youth.vocational.eyebrow')}
            </span>
            <h2 className="mt-3 text-3xl font-bold text-white">{t('youth.vocational.title')}</h2>
            <p className="mt-4 text-forest-100/80">{t('youth.vocational.sub')}</p>
          </Reveal>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vocational.map((v, i) => (
              <Reveal key={v.name} delay={(i % 3) * 80} className="rounded-2xl bg-forest-800/60 p-6 dark:bg-forest-900/80">
                <h3 className="font-display text-lg font-bold text-white">{v.name}</h3>
                {v.local && v.local !== v.name && (
                  <p className="mt-1 text-sm italic text-gold-300">{v.local}</p>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
