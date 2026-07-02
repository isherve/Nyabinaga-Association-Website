import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { featuredImages, site, contact } from '../content/site'
import { useSettings } from '../context/SettingsContext'
import { MapPin, Mail, Phone, ArrowRight, Check } from '../components/Icons'

export default function Contact() {
  const { t } = useSettings()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const sendViaMailto = () => {
    const subject = encodeURIComponent(`Website message from ${form.name || 'a visitor'}`)
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
    const [to, ...cc] = contact.emails
    window.location.href = `mailto:${to}?cc=${cc.join(',')}&subject=${subject}&body=${body}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // No Formspree configured → open the visitor's email app (v1 behaviour).
    if (!contact.formspreeId) {
      sendViaMailto()
      return
    }

    setStatus('sending')
    try {
      const res = await fetch(`https://formspree.io/f/${contact.formspreeId}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          _subject: `Website message from ${form.name || 'a visitor'}`,
        }),
      })
      if (res.ok) {
        setStatus('sent')
        setForm({ name: '', email: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
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
                  <Phone className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-display font-bold text-forest-900 dark:text-forest-50">{t('contact.phone')}</h3>
                  <a href={`tel:${contact.phoneRaw}`} className="mt-1 inline-block text-muted underline decoration-gold-400 underline-offset-4 hover:text-forest-800 dark:hover:text-forest-100">
                    {contact.phoneDisplay}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
                  <Mail className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-display font-bold text-forest-900 dark:text-forest-50">{t('contact.email')}</h3>
                  <div className="mt-1 flex flex-col gap-1">
                    {contact.emails.map((email) => (
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
            {status === 'sent' ? (
              <div className="card flex h-full flex-col items-center justify-center p-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
                  <Check className="h-8 w-8" />
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold text-forest-900 dark:text-forest-50">
                  {t('contact.sent.title')}
                </h3>
                <p className="mt-2 text-muted">{t('contact.sent.text')}</p>
                <button type="button" onClick={() => setStatus('idle')} className="btn-outline mt-6">
                  {t('contact.sent.again')}
                </button>
              </div>
            ) : (
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
                  {status === 'error' && (
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">{t('contact.error')}</p>
                  )}
                  <button type="submit" disabled={status === 'sending'} className="btn-primary w-full text-base disabled:opacity-60">
                    {status === 'sending' ? t('contact.sending') : t('common.sendMessage')} <ArrowRight className="h-5 w-5" />
                  </button>
                  <p className="text-center text-xs text-earth-500 dark:text-forest-400">
                    {contact.formspreeId ? t('contact.formNoteOnline') : t('contact.formNote')}
                  </p>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </>
  )
}
