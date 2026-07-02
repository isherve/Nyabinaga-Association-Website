import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { ArrowRight } from '../components/Icons'

export default function NotFound() {
  const { t } = useSettings()

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-earth-50 dark:bg-forest-950">
      <div className="container-page text-center">
        <p className="font-display text-7xl font-extrabold text-forest-200 dark:text-forest-800">404</p>
        <h1 className="mt-4 text-3xl font-bold text-forest-900 dark:text-forest-50">{t('notFound.title')}</h1>
        <p className="mt-3 text-muted">{t('notFound.sub')}</p>
        <Link to="/" className="btn-primary mt-8">
          {t('common.backHome')} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
