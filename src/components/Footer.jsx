import { Link } from 'react-router-dom'
import { site, socials, contact } from '../content/site'
import { navRouteKeys } from '../content/translations'
import { useSettings } from '../context/SettingsContext'
import { MapPin, Phone, Mail, Facebook, Instagram, YouTube } from './Icons'

const socialLinks = [
  { key: 'facebook', href: socials.facebook, Icon: Facebook, label: 'Facebook' },
  { key: 'instagram', href: socials.instagram, Icon: Instagram, label: 'Instagram' },
  { key: 'youtube', href: socials.youtube, Icon: YouTube, label: 'YouTube' },
].filter((s) => s.href)

export default function Footer() {
  const { t } = useSettings()
  const explore = navRouteKeys.slice(0, 4)
  const more = navRouteKeys.slice(4)

  return (
    <footer className="mt-auto border-t border-earth-200 bg-forest-900 text-forest-50 dark:border-forest-800">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt={`${site.name} logo`}
              className="h-11 w-11 rounded-full bg-white object-contain p-0.5"
            />
            <span className="font-display text-lg font-bold">{site.name}</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-forest-100/80">{t('site.description')}</p>
          <p className="mt-6 flex items-start gap-2 text-sm text-forest-100/80">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-400" />
            <span>{site.locationLine}</span>
          </p>
          <div className="mt-4 space-y-2 text-sm text-forest-100/80">
            <a href={`tel:${contact.phoneRaw}`} className="flex items-center gap-2 transition-colors hover:text-white">
              <Phone className="h-5 w-5 shrink-0 text-gold-400" />
              <span>{contact.phoneDisplay}</span>
            </a>
            <a href={`mailto:${contact.emails[0]}`} className="flex items-center gap-2 transition-colors hover:text-white">
              <Mail className="h-5 w-5 shrink-0 text-gold-400" />
              <span className="break-all">{contact.emails[0]}</span>
            </a>
          </div>
          {socialLinks.length > 0 && (
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map(({ key, href, Icon, label }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-800 text-forest-100 transition-colors hover:bg-gold-500 hover:text-forest-900"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-gold-300">
            {t('footer.explore')}
          </h3>
          <ul className="mt-4 space-y-2">
            {explore.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-forest-100/80 transition-colors hover:text-white"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-gold-300">
            {t('footer.more')}
          </h3>
          <ul className="mt-4 space-y-2">
            {more.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-forest-100/80 transition-colors hover:text-white"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-forest-800">
        <div className="container-page py-6 text-center text-sm text-forest-100/70">
          <p>
            &copy; {new Date().getFullYear()} {site.name}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  )
}
