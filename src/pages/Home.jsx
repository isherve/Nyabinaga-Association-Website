import { Link } from 'react-router-dom'
import { site, featuredImages } from '../content/site'
import { heroStats } from '../content/stats'
import { groups, formatRWF } from '../content/groups'
import { tp } from '../content/groupTranslations'
import { useSettings } from '../context/SettingsContext'
import Reveal from '../components/Reveal'
import AnimatedNumber from '../components/AnimatedNumber'
import HeroSlideshow from '../components/HeroSlideshow'
import { iconMap, ArrowRight, MapPin } from '../components/Icons'

const whatWeDoKeys = [
  { icon: 'sprout', title: 'home.whatWeDo.livelihood.title', text: 'home.whatWeDo.livelihood.text' },
  { icon: 'book', title: 'home.whatWeDo.children.title', text: 'home.whatWeDo.children.text' },
  { icon: 'users', title: 'home.whatWeDo.youth.title', text: 'home.whatWeDo.youth.text' },
  { icon: 'coins', title: 'home.whatWeDo.savings.title', text: 'home.whatWeDo.savings.text' },
]

const statLabelKeys = [
  'home.stats.beneficiaries',
  'home.stats.groups',
  'home.stats.registered',
  'home.stats.assets',
]

export default function Home() {
  const { t, lang } = useSettings()

  return (
    <>
      <section className="relative overflow-hidden">
        <HeroSlideshow />

        <div className="container-page relative flex min-h-[88vh] flex-col justify-center py-24">
          <span className="animate-fade-in inline-flex w-fit items-center gap-2 rounded-full bg-gold-400/20 px-4 py-1.5 text-sm font-semibold text-gold-200">
            <MapPin className="h-4 w-4" /> {t('home.hero.location')}
          </span>
          <h1 className="animate-fade-up mt-6 max-w-3xl text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
            {site.name} — {t('home.hero.headline')}{' '}
            <span className="text-gold-300">{t('home.hero.headlineAccent')}</span>
          </h1>
          <p className="animate-fade-up mt-6 max-w-2xl text-lg leading-relaxed text-forest-50/90 sm:text-xl">
            {t('home.hero.sub')}
          </p>
          <div className="animate-fade-up mt-9 flex flex-wrap gap-4">
            <Link to="/groups" className="btn-gold text-base">
              {t('home.hero.ctaGroups')} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="btn border-2 border-white/70 text-base text-white hover:bg-white hover:text-forest-800"
            >
              {t('home.hero.ctaContact')}
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-forest-800 dark:bg-forest-950">
        <div className="container-page grid grid-cols-2 gap-6 py-10 sm:py-12 lg:grid-cols-4">
          {heroStats.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl font-extrabold text-gold-300 sm:text-4xl">
                <AnimatedNumber
                  value={stat.value}
                  suffix={stat.compact ? (lang === 'en' ? ' RWF' : ' FRW') : stat.suffix}
                  compact={stat.compact}
                />
              </div>
              <div className="mt-2 text-sm font-medium text-forest-50/80">{t(statLabelKeys[i])}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">{t('home.whatWeDo.eyebrow')}</span>
            <h2 className="mt-3 text-3xl font-bold text-forest-900 dark:text-forest-50 sm:text-4xl">
              {t('home.whatWeDo.title')}
            </h2>
            <p className="mt-4 text-lg text-muted">{t('home.whatWeDo.sub')}</p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whatWeDoKeys.map((card, i) => {
              const Icon = iconMap[card.icon]
              return (
                <Reveal
                  key={card.title}
                  delay={i * 90}
                  className="card group p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-100 text-forest-600 transition-colors group-hover:bg-forest-600 group-hover:text-white dark:bg-forest-800 dark:text-gold-400 dark:group-hover:bg-forest-500">
                    {Icon && <Icon className="h-7 w-7" />}
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-forest-900 dark:text-forest-50">
                    {t(card.title)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{t(card.text)}</p>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section surface-muted">
        <div className="container-page">
          <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <span className="eyebrow">{t('home.groups.eyebrow')}</span>
              <h2 className="mt-3 text-3xl font-bold text-forest-900 dark:text-forest-50 sm:text-4xl">
                {t('home.groups.title')}
              </h2>
            </div>
            <Link to="/groups" className="btn-outline whitespace-nowrap">
              {t('home.groups.viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.slice(0, 3).map((group, i) => (
              <Reveal
                key={group.id}
                delay={i * 90}
                className="card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={group.image}
                    alt={group.name}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-forest-900 dark:text-forest-50">
                    {group.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-gold-600 dark:text-gold-400">
                    {tp(group.activity, lang)}
                  </p>
                  {group.totalAssets > 0 && (
                    <p className="mt-4 text-sm text-muted">
                      {t('common.groupAssets')}:{' '}
                      <span className="font-semibold text-forest-800 dark:text-forest-100">
                        {formatRWF(group.totalAssets, lang)}
                      </span>
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={featuredImages.ctaBanner} alt="" aria-hidden="true" className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-forest-900/85" />
        </div>
        <div className="container-page relative py-20 text-center">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white sm:text-4xl">
              {t('home.cta.title')}
            </h2>
            <div className="mt-8">
              <Link to="/groups" className="btn-gold text-base">
                {t('home.cta.button')} <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
