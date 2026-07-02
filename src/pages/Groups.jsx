import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import GroupCard from '../components/GroupCard'
import { groups, registeredGroupNames } from '../content/groups'
import { featuredImages } from '../content/site'
import { useSettings } from '../context/SettingsContext'
import { Check } from '../components/Icons'

export default function Groups() {
  const { t } = useSettings()

  return (
    <>
      <PageHeader
        eyebrow={t('groups.eyebrow')}
        title={t('groups.title')}
        subtitle={t('groups.subtitle')}
        image={featuredImages.groups}
      />

      <section className="section">
        <div className="container-page">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-lg leading-relaxed text-muted">{t('groups.intro')}</p>
          </Reveal>
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group, i) => (
              <Reveal key={group.id} delay={(i % 3) * 90}>
                <GroupCard group={group} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-forest-900 text-forest-50 dark:bg-forest-950">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-gold-400/20 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-gold-200">
              {t('groups.registered.eyebrow')}
            </span>
            <h2 className="mt-3 text-3xl font-bold text-white">{t('groups.registered.title')}</h2>
            <p className="mt-4 text-forest-100/80">{t('groups.registered.sub')}</p>
          </Reveal>
          <div className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {registeredGroupNames.map((name, i) => (
              <Reveal
                key={name}
                delay={(i % 3) * 70}
                className="flex items-center gap-3 rounded-2xl bg-forest-800/60 px-5 py-4 dark:bg-forest-900/80"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500 text-forest-900">
                  <Check className="h-4 w-4" />
                </span>
                <span className="font-medium text-forest-50">{name}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
