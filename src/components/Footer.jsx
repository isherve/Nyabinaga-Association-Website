import { Link } from 'react-router-dom'
import { site } from '../content/site'
import { navRouteKeys } from '../content/translations'
import { useSettings } from '../context/SettingsContext'
import { MapPin } from './Icons'

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
