import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { site } from '../content/site'
import { navRouteKeys } from '../content/translations'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import PasswordModal from './PasswordModal'
import ThemeToggle from './ThemeToggle'
import LanguageSelector from './LanguageSelector'
import { Menu, Close, Lock, Unlock, ChevronDown, Users, Book, ArrowRight, Coins, Spark, Mail, Heart } from './Icons'

const routeByPath = Object.fromEntries(navRouteKeys.map((r) => [r.to, r]))
const pick = (...paths) => paths.map((p) => routeByPath[p]).filter(Boolean)

const mainRoutes = pick('/', '/about', '/groups')
const programRoutes = pick('/youth', '/children')
const moreRoutes = pick('/impact', '/gallery', '/team', '/contact')

const programIcons = { '/youth': Users, '/children': Book }
const moreIcons = { '/impact': Coins, '/gallery': Spark, '/team': Users, '/contact': Mail }

function NavItem({ to, label, end, onClick, className = '', pill = true }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `${pill ? 'rounded-full px-3.5 py-2' : 'block rounded-xl px-4 py-3'} text-sm font-medium transition-colors ${className} ${
          isActive
            ? 'bg-forest-600 text-white shadow-sm dark:bg-forest-500'
            : 'text-forest-700 hover:bg-earth-100 hover:text-forest-900 dark:text-forest-100 dark:hover:bg-forest-800 dark:hover:text-white'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export default function Navbar() {
  const { t } = useSettings()
  const { isAdmin, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [programsOpen, setProgramsOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const programsRef = useRef(null)
  const moreRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [adminLogin, setAdminLogin] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
    setProgramsOpen(false)
    setMoreOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!programsOpen && !moreOpen) return
    const onClick = (e) => {
      if (programsRef.current && !programsRef.current.contains(e.target)) setProgramsOpen(false)
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [programsOpen, moreOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const programsActive = programRoutes.some((r) => location.pathname === r.to)
  const moreActive = moreRoutes.some((r) => location.pathname === r.to)

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 shadow-[0_4px_24px_-12px_rgba(38,70,35,0.35)] backdrop-blur-md dark:bg-forest-950/90'
          : 'bg-white/70 backdrop-blur-sm dark:bg-forest-950/70'
      }`}
    >
      {/* Top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-forest-600 via-gold-400 to-earth-500" />

      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-3 lg:h-[4.5rem]">
          {/* Brand */}
          <Link to="/" className="group flex min-w-0 shrink-0 items-center gap-3">
            <img
              src="/images/logo.png"
              alt={`${site.name} logo`}
              className="h-11 w-11 shrink-0 rounded-full bg-white object-contain shadow-sm ring-2 ring-gold-400/40 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-display text-sm font-bold text-forest-900 dark:text-forest-50 sm:text-[0.98rem]">
                {site.name}
              </span>
              <span className="hidden truncate text-[11px] font-medium text-earth-600 dark:text-forest-300 sm:block">
                {t('site.tagline')}
              </span>
            </span>
          </Link>

          {/* Desktop navigation — centered pill bar */}
          <nav className="hidden flex-1 items-center justify-center lg:flex" aria-label="Main navigation">
            <div className="inline-flex items-center gap-0.5 rounded-full border border-earth-100 bg-earth-50/80 p-1 shadow-inner dark:border-forest-800 dark:bg-forest-900/80">
              {mainRoutes.map((item) => (
                <NavItem key={item.to} to={item.to} label={t(item.key)} end={item.to === '/'} />
              ))}

              {/* Programs dropdown */}
              <div className="relative" ref={programsRef}>
                <button
                  type="button"
                  onClick={() => setProgramsOpen((v) => !v)}
                  className={`inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    programsActive
                      ? 'bg-forest-600 text-white shadow-sm dark:bg-forest-500'
                      : 'text-forest-700 hover:bg-earth-100 dark:text-forest-100 dark:hover:bg-forest-800'
                  }`}
                  aria-expanded={programsOpen}
                >
                  {t('nav.programs')}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${programsOpen ? 'rotate-180' : ''}`} />
                </button>
                {programsOpen && (
                  <div className="absolute left-1/2 top-full z-50 mt-3 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border border-earth-100 bg-white p-1.5 shadow-xl dark:border-forest-700 dark:bg-forest-900">
                    {programRoutes.map((item) => {
                      const Icon = programIcons[item.to]
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setProgramsOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                              isActive
                                ? 'bg-forest-50 font-semibold text-forest-800 dark:bg-forest-800 dark:text-gold-300'
                                : 'text-forest-700 hover:bg-earth-50 dark:text-forest-100 dark:hover:bg-forest-800'
                            }`
                          }
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-100 text-forest-600 dark:bg-forest-950 dark:text-gold-400">
                            {Icon && <Icon className="h-5 w-5" />}
                          </span>
                          {t(item.key)}
                        </NavLink>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* More dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  className={`inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    moreActive
                      ? 'bg-forest-600 text-white shadow-sm dark:bg-forest-500'
                      : 'text-forest-700 hover:bg-earth-100 dark:text-forest-100 dark:hover:bg-forest-800'
                  }`}
                  aria-expanded={moreOpen}
                >
                  {t('nav.more')}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreOpen && (
                  <div className="absolute left-1/2 top-full z-50 mt-3 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border border-earth-100 bg-white p-1.5 shadow-xl dark:border-forest-700 dark:bg-forest-900">
                    {moreRoutes.map((item) => {
                      const Icon = moreIcons[item.to]
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setMoreOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                              isActive
                                ? 'bg-forest-50 font-semibold text-forest-800 dark:bg-forest-800 dark:text-gold-300'
                                : 'text-forest-700 hover:bg-earth-50 dark:text-forest-100 dark:hover:bg-forest-800'
                            }`
                          }
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-100 text-forest-600 dark:bg-forest-950 dark:text-gold-400">
                            {Icon && <Icon className="h-5 w-5" />}
                          </span>
                          {t(item.key)}
                        </NavLink>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="hidden items-center gap-1.5 sm:flex">
              <LanguageSelector />
              <ThemeToggle />
            </div>

            {/* Divider */}
            <span className="mx-0.5 hidden h-6 w-px bg-earth-200 dark:bg-forest-700 md:block" />

            {isAdmin ? (
              <button
                type="button"
                onClick={logout}
                className="hidden items-center gap-1.5 rounded-full bg-forest-100 px-3 py-2 text-xs font-semibold text-forest-700 transition-colors hover:bg-forest-200 dark:bg-forest-800 dark:text-forest-100 dark:hover:bg-forest-700 md:inline-flex"
                title={t('nav.adminLogout')}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                <Unlock className="h-4 w-4" />
                <span className="hidden xl:inline">{t('nav.adminLogout')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAdminLogin(true)}
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-earth-200 text-forest-700 transition-colors hover:border-forest-400 hover:bg-earth-100 dark:border-forest-700 dark:text-forest-200 dark:hover:bg-forest-800 md:inline-flex"
                aria-label={t('nav.adminLogin')}
                title={t('nav.adminLogin')}
              >
                <Lock className="h-4 w-4" />
              </button>
            )}

            <Link to="/donate" className="btn-gold group hidden px-4 py-2.5 text-xs sm:px-5 sm:text-sm md:inline-flex">
              <Heart className="h-4 w-4" />
              {t('nav.donate')}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-earth-200 text-forest-800 transition-colors hover:bg-earth-100 dark:border-forest-700 dark:text-forest-100 dark:hover:bg-forest-800 lg:hidden"
              aria-label={t('nav.openMenu')}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-forest-950/60 backdrop-blur-sm"
            aria-label={t('nav.closeMenu')}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl dark:bg-forest-950">
            <div className="flex items-center justify-between border-b border-earth-100 px-5 py-4 dark:border-forest-800">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/logo.png"
                  alt={`${site.name} logo`}
                  className="h-9 w-9 rounded-full bg-white object-contain ring-2 ring-gold-400/40"
                />
                <span className="font-display font-bold text-forest-900 dark:text-forest-50">{site.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-forest-700 hover:bg-earth-100 dark:text-forest-200 dark:hover:bg-forest-800"
                aria-label={t('nav.closeMenu')}
              >
                <Close className="h-5 w-5" />
              </button>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 border-b border-earth-100 bg-forest-50 px-5 py-2.5 text-xs font-semibold text-forest-700 dark:border-forest-800 dark:bg-forest-900 dark:text-gold-300">
                <span className="h-2 w-2 rounded-full bg-green-500" /> {t('nav.adminLogout').split('·')[0]}
              </div>
            )}

            <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Mobile navigation">
              <ul className="space-y-1">
                {navRouteKeys
                  .filter((item) => item.to !== '/donate')
                  .map((item) => (
                    <li key={item.to}>
                      <NavItem
                        to={item.to}
                        label={t(item.key)}
                        end={item.to === '/'}
                        onClick={() => setMobileOpen(false)}
                        pill={false}
                      />
                    </li>
                  ))}
              </ul>
            </nav>

            <div className="space-y-3 border-t border-earth-100 p-4 dark:border-forest-800">
              <div className="flex items-center justify-between gap-3">
                <LanguageSelector />
                <ThemeToggle />
              </div>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setMobileOpen(false)
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest-100 px-4 py-3 text-sm font-semibold text-forest-700 dark:bg-forest-800 dark:text-forest-100"
                >
                  <Unlock className="h-4 w-4" /> {t('nav.adminLogout')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAdminLogin(true)
                    setMobileOpen(false)
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-earth-200 px-4 py-3 text-sm font-medium text-forest-700 dark:border-forest-700 dark:text-forest-100"
                >
                  <Lock className="h-4 w-4" /> {t('nav.adminLogin')}
                </button>
              )}
              <Link to="/donate" onClick={() => setMobileOpen(false)} className="btn-gold w-full">
                <Heart className="h-4 w-4" /> {t('nav.donate')}
              </Link>
            </div>
          </div>
        </div>
      )}

      <PasswordModal open={adminLogin} mode="admin" onClose={() => setAdminLogin(false)} />
    </header>
  )
}
