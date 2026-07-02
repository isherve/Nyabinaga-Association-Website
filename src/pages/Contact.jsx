import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { featuredImages, site } from '../content/site'
import { useSettings } from '../context/SettingsContext'
import { MapPin, Mail, ArrowRight } from '../components/Icons'

// Messages are sent to both project addresses.
const CONTACT_EMAILS = ['rw164projdirector@gmail.com', 'jeromemunyansanga@gmail.com']

export default function Contact() {
  const { t } = useSettings()
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Website message from ${form.name || 'a visitor'}`)
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
    // Send to the first address, CC the second so both receive the message.
    const [to, ...cc] = CONTACT_EMAILS
    window.location.href = `mailto:${to}?cc=${cc.join(',')}&subject=${subject}&body=${body}`
  }

  return (
    <>
      <PageHeader
        eyebrow={t('contact.eyebrow')}
        title={t('contact.title')}
        subtitle={t('contact.subtitle')}
        image={featuredImages.contact}
      />

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">{t('contact.getInTouch')}</span>
            <h2 className="mt-3 text-3xl font-bold text-forest-900 dark:text-forest-50">{t('contact.visit')}</h2>

            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
                  <MapPin className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-display font-bold text-forest-900 dark:text-forest-50">{t('contact.location')}</h3>
                  <p className="mt-1 text-muted">{site.locationLine}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
                  <Mail className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-display font-bold text-forest-900 dark:text-forest-50">{t('contact.email')}</h3>
                  <div className="mt-1 flex flex-col gap-1">
                    {CONTACT_EMAILS.map((email) => (
                      <a
                        key={email}
                        href={`mailto:${email}`}
                        className="inline-block break-all text-muted underline decoration-gold-400 underline-offset-4 hover:text-forest-800 dark:hover:text-forest-100"
                      >
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl shadow-md">
              <iframe
                title="Map"
                className="h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.openstreetmap.org/export/embed.html?bbox=29.05%2C-2.42%2C29.20%2C-2.30&layer=mapnik&marker=-2.36%2C29.12"
              />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <form onSubmit={handleSubmit} className="card p-8">
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-forest-800 dark:text-forest-100">{t('contact.name')}</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t('contact.namePlaceholder')}
                    className="mt-2 w-full rounded-xl border border-earth-200 bg-earth-50 px-4 py-3 text-forest-900 focus:border-forest-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-200 dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50 dark:focus:bg-forest-900"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-forest-800 dark:text-forest-100">{t('contact.email')}</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder={t('contact.emailPlaceholder')}
                    className="mt-2 w-full rounded-xl border border-earth-200 bg-earth-50 px-4 py-3 text-forest-900 focus:border-forest-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-200 dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50 dark:focus:bg-forest-900"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-forest-800 dark:text-forest-100">{t('contact.message')}</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    required
                    value={form.message}
                    onChange={handleChange}
                    placeholder={t('contact.messagePlaceholder')}
                    className="mt-2 w-full resize-y rounded-xl border border-earth-200 bg-earth-50 px-4 py-3 text-forest-900 focus:border-forest-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-200 dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50 dark:focus:bg-forest-900"
                  />
                </div>
                <button type="submit" className="btn-primary w-full text-base">
                  {t('common.sendMessage')} <ArrowRight className="h-5 w-5" />
                </button>
                <p className="text-center text-xs text-earth-500 dark:text-forest-400">{t('contact.formNote')}</p>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  )
}
