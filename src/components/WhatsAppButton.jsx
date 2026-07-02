import { contact } from '../content/site'
import { WhatsApp } from './Icons'
import { useSettings } from '../context/SettingsContext'

export default function WhatsAppButton() {
  const { t } = useSettings()
  if (!contact.whatsapp) return null

  const message = encodeURIComponent(t('whatsapp.prefill'))
  const href = `https://wa.me/${contact.whatsapp}?text=${message}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('whatsapp.label')}
      title={t('whatsapp.label')}
      className="group fixed bottom-5 right-5 z-[80] flex items-center gap-2 rounded-full bg-[#25D366] p-4 text-white shadow-lg shadow-black/20 transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 sm:bottom-6 sm:right-6"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-40" />
      <WhatsApp className="relative h-6 w-6" />
      <span className="relative hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-xs group-hover:pr-1 sm:inline">
        {t('whatsapp.label')}
      </span>
    </a>
  )
}
