import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { contact, donation, featuredImages } from '../content/site'
import { useSettings } from '../context/SettingsContext'
import { Phone, Coins, Mail, ArrowRight, Heart, Sprout, Book, Users } from '../components/Icons'

export default function Donate() {
  const { t } = useSettings()

  const impactPoints = [
    { icon: Book, text: t('donate.impact.1') },
    { icon: Sprout, text: t('donate.impact.2') },
    { icon: Users, text: t('donate.impact.3') },
  ]

  const hasBank = donation.bank.accountNumber || donation.bank.bankName
  const hasMomo = donation.mobileMoney.number

  return (
    <>
      <PageHeader
        eyebrow={t('donate.eyebrow')}
        title={t('donate.title')}
        subtitle={t('donate.subtitle')}
        image={featuredImages.impact}
      />

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">{t('donate.why.eyebrow')}</span>
            <h2 className="mt-3 text-3xl font-bold text-forest-900 dark:text-forest-50">
              {t('donate.why.title')}
            </h2>
            <p className="mt-4 text-muted">{t('donate.why.text')}</p>

            <ul className="mt-8 space-y-4">
              {impactPoints.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="pt-1.5 text-forest-800 dark:text-forest-100">{text}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <div className="space-y-5">
              {hasMomo && (
                <div className="card p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-100 text-gold-600 dark:bg-forest-800 dark:text-gold-400">
                      <Phone className="h-6 w-6" />
                    </span>
                    <h3 className="font-display text-xl font-bold text-forest-900 dark:text-forest-50">
                      {t('donate.momo.title')}
                    </h3>
                  </div>
                  <p className="mt-4 text-muted">{t('donate.momo.text')}</p>
                  <dl className="mt-4 space-y-2 rounded-2xl bg-earth-50 p-4 dark:bg-forest-950">
                    <div className="flex justify-between gap-4">
                      <dt className="text-sm text-muted">{t('donate.momo.name')}</dt>
                      <dd className="text-right font-semibold text-forest-900 dark:text-forest-50">
                        {donation.mobileMoney.name}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-sm text-muted">{t('donate.momo.number')}</dt>
                      <dd className="text-right font-mono font-semibold text-forest-900 dark:text-forest-50">
                        {donation.mobileMoney.number}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              {hasBank && (
                <div className="card p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
                      <Coins className="h-6 w-6" />
                    </span>
                    <h3 className="font-display text-xl font-bold text-forest-900 dark:text-forest-50">
                      {t('donate.bank.title')}
                    </h3>
                  </div>
                  <dl className="mt-4 space-y-2 rounded-2xl bg-earth-50 p-4 dark:bg-forest-950">
                    {donation.bank.bankName && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-sm text-muted">{t('donate.bank.bankName')}</dt>
                        <dd className="text-right font-semibold text-forest-900 dark:text-forest-50">{donation.bank.bankName}</dd>
                      </div>
                    )}
                    {donation.bank.accountName && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-sm text-muted">{t('donate.bank.accountName')}</dt>
                        <dd className="text-right font-semibold text-forest-900 dark:text-forest-50">{donation.bank.accountName}</dd>
                      </div>
                    )}
                    {donation.bank.accountNumber && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-sm text-muted">{t('donate.bank.accountNumber')}</dt>
                        <dd className="text-right font-mono font-semibold text-forest-900 dark:text-forest-50">{donation.bank.accountNumber}</dd>
                      </div>
                    )}
                    {donation.bank.swift && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-sm text-muted">SWIFT/BIC</dt>
                        <dd className="text-right font-mono font-semibold text-forest-900 dark:text-forest-50">{donation.bank.swift}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              <div className="card border-2 border-forest-100 p-7 dark:border-forest-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-600 text-white">
                    <Heart className="h-6 w-6" />
                  </span>
                  <h3 className="font-display text-xl font-bold text-forest-900 dark:text-forest-50">
                    {t('donate.contact.title')}
                  </h3>
                </div>
                <p className="mt-4 text-muted">{t('donate.contact.text')}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to="/contact" className="btn-primary">
                    {t('donate.contact.button')} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href={`mailto:${contact.emails[0]}`} className="btn-outline">
                    <Mail className="h-4 w-4" /> {t('contact.email')}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
