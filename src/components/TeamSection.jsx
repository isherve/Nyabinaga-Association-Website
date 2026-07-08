import { useEffect, useState } from 'react'
import Reveal from './Reveal'
import { staffRoles } from '../content/staff'
import { formatPhone } from '../content/members'
import {
  addStaffTeamMember,
  getStaffTeamMembers,
  removeAddedStaffTeamMember,
} from '../content/staffTeamMembers'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { formatPersonName } from '../lib/formatPersonName'
import { getLeadership, updateLeaderBio } from '../lib/leadershipStore'
import { Check, Close, Info, Pencil, Phone, Trash, Users } from './Icons'

function TeamPhoto({ leader, className = 'h-36 w-36' }) {
  const hasPhoto = Boolean(leader.photo?.trim())

  return (
    <div
      className={`relative mx-auto shrink-0 overflow-hidden rounded-full bg-earth-100 shadow-md ring-4 ring-white dark:bg-forest-800 dark:ring-forest-700 ${className}`}
    >
      {hasPhoto ? (
        <img
          src={leader.photo}
          alt={formatPersonName(leader.name)}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-forest-700 to-forest-900 font-display text-3xl font-bold text-white/90">
          {leader.name?.charAt(0) || '?'}
        </div>
      )}
    </div>
  )
}

export default function TeamSection() {
  const { t } = useSettings()
  const { isAdmin } = useAuth()
  const [leaders, setLeaders] = useState(() => getLeadership())
  const [detail, setDetail] = useState(null)
  const [editingBio, setEditingBio] = useState(false)
  const [bioDraft, setBioDraft] = useState('')
  const [staffTeam, setStaffTeam] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [memberForm, setMemberForm] = useState({ name: '', phone: '' })
  const [director, ...management] = leaders

  const modalOpen = Boolean(detail || staffTeam)

  useEffect(() => {
    if (!modalOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (detail) setDetail(null)
      else setStaffTeam(null)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [modalOpen, detail])

  useEffect(() => {
    if (!detail) {
      setEditingBio(false)
      setBioDraft('')
    }
  }, [detail])

  const openDetail = (leader) => {
    setEditingBio(false)
    setBioDraft(leader.bio || '')
    setDetail(leader)
  }

  const startEditBio = () => {
    setBioDraft(detail?.bio || '')
    setEditingBio(true)
  }

  const cancelEditBio = () => {
    setBioDraft(detail?.bio || '')
    setEditingBio(false)
  }

  const saveBio = () => {
    if (!detail) return
    const updated = updateLeaderBio(detail.name, bioDraft)
    const next = updated.find((l) => l.name === detail.name)
    setLeaders(updated)
    setDetail(next || detail)
    setEditingBio(false)
  }

  const teamLabel = (team) => (team.roleKey ? t(team.roleKey) : team.role)

  const openStaffTeam = (team) => {
    setStaffTeam(team)
    setTeamMembers(getStaffTeamMembers(team.id))
    setMemberForm({ name: '', phone: '' })
  }

  const handleAddTeamMember = (e) => {
    e.preventDefault()
    if (!staffTeam || !memberForm.name.trim()) return
    setTeamMembers(addStaffTeamMember(staffTeam.id, memberForm))
    setMemberForm({ name: '', phone: '' })
  }

  const handleRemoveTeamMember = (id) => {
    if (!staffTeam) return
    setTeamMembers(removeAddedStaffTeamMember(staffTeam.id, id))
  }

  const memberCount = (team) => {
    const count = getStaffTeamMembers(team.id).length
    return count || team.number
  }

  return (
    <section id="team" className="section scroll-mt-24 bg-earth-100/50 dark:bg-forest-900/30">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{t('team.leadership.eyebrow')}</span>
          <h2 className="mt-3 text-3xl font-bold text-forest-900 dark:text-forest-50 sm:text-4xl">
            {t('team.leadership.title')}
          </h2>
          <p className="mt-4 text-muted">{t('team.leadership.sub')}</p>
        </Reveal>

        {director && (
          <Reveal className="mt-12">
            <article className="card mx-auto max-w-4xl overflow-hidden">
              <div className="flex flex-col items-center gap-8 p-8 text-center sm:flex-row sm:p-10 sm:text-left">
                <TeamPhoto leader={director} className="h-44 w-44 sm:h-48 sm:w-48" />
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-full bg-forest-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest-700 dark:bg-forest-800 dark:text-gold-300">
                    {t('team.director.eyebrow')}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-bold tracking-wide text-forest-900 dark:text-forest-50 sm:text-3xl">
                    {formatPersonName(director.name)}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <p className="text-lg font-semibold text-forest-600 dark:text-gold-400">{director.role}</p>
                    {director.bio && (
                      <button
                        type="button"
                        onClick={() => openDetail(director)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-forest-600 text-white transition-colors hover:bg-forest-700 dark:bg-forest-500 dark:hover:bg-forest-400"
                        aria-label={t('team.viewDetails')}
                        title={t('team.viewDetails')}
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        )}

        {management.length > 0 && (
          <>
            <div className="mb-8 mt-14 rounded-2xl bg-forest-800 px-6 py-3.5 text-center dark:bg-forest-950">
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white sm:text-base">
                {t('team.management.title')}
              </h3>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {management.map((leader, i) => (
                <Reveal key={leader.name} delay={(i % 4) * 70}>
                  <article className="card flex h-full flex-col items-center p-6 text-center">
                    <TeamPhoto leader={leader} />
                    <h3 className="mt-5 font-display text-base font-bold tracking-wide text-forest-900 dark:text-forest-50">
                      {formatPersonName(leader.name)}
                    </h3>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <p className="text-sm font-semibold text-forest-600 dark:text-gold-400">{leader.role}</p>
                      {leader.bio && (
                        <button
                          type="button"
                          onClick={() => openDetail(leader)}
                          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-700 transition-colors hover:bg-forest-600 hover:text-white dark:bg-forest-800 dark:text-gold-300 dark:hover:bg-forest-500"
                          aria-label={t('team.viewDetails')}
                          title={t('team.viewDetails')}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </>
        )}

        <Reveal className="mt-16">
          <span className="eyebrow">{t('team.structure.eyebrow')}</span>
          <h3 className="mt-3 text-2xl font-bold text-forest-900 dark:text-forest-50">{t('team.structure.title')}</h3>
          <p className="mt-3 max-w-2xl text-muted">{t('team.structure.sub')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {staffRoles.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openStaffTeam(item)}
                className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white px-4 py-2.5 text-sm font-medium text-forest-800 shadow-sm transition-colors hover:border-forest-400 hover:bg-forest-50 dark:border-forest-700 dark:bg-forest-900 dark:text-forest-100 dark:hover:border-forest-500 dark:hover:bg-forest-800"
                aria-label={`${t('team.viewMembers')}: ${teamLabel(item)}`}
              >
                <Users className="h-4 w-4 shrink-0 text-forest-500 dark:text-gold-400" />
                <span>{teamLabel(item)}</span>
                <span className="shrink-0 rounded-full bg-forest-100 px-1.5 py-0.5 text-xs font-bold tabular-nums text-forest-700 dark:bg-forest-800 dark:text-gold-300">
                  {memberCount(item)}
                </span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      {detail && (
        <div
          className="animate-fade-in fixed inset-0 z-[110] flex items-center justify-center bg-forest-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="team-detail-title"
          onClick={() => setDetail(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-forest-900 dark:ring-1 dark:ring-forest-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-earth-500 hover:bg-earth-100 dark:text-forest-300 dark:hover:bg-forest-800"
              aria-label={t('auth.close')}
            >
              <Close className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <TeamPhoto leader={detail} className="h-28 w-28" />
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-forest-600 dark:text-gold-400">
                {t('team.roleDetails')}
              </p>
              <h3 id="team-detail-title" className="mt-2 font-display text-xl font-bold tracking-wide text-forest-900 dark:text-forest-50">
                {formatPersonName(detail.name)}
              </h3>
              <p className="mt-1 text-sm font-semibold text-forest-600 dark:text-gold-400">{detail.role}</p>
              {(detail.bio || editingBio) && (
                <div className="mt-5 w-full">
                  {editingBio ? (
                    <>
                      <textarea
                        value={bioDraft}
                        onChange={(e) => setBioDraft(e.target.value)}
                        rows={5}
                        className="w-full rounded-xl border border-forest-200 bg-earth-50 px-3 py-2.5 text-left text-sm leading-relaxed text-forest-900 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20 dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                        autoFocus
                      />
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEditBio}
                          className="rounded-lg border border-forest-200 px-3 py-1.5 text-sm font-medium text-forest-700 hover:bg-earth-100 dark:border-forest-700 dark:text-forest-200 dark:hover:bg-forest-800"
                        >
                          {t('team.cancelEdit')}
                        </button>
                        <button
                          type="button"
                          onClick={saveBio}
                          disabled={!bioDraft.trim()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-forest-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-forest-500 dark:hover:bg-forest-400"
                        >
                          <Check className="h-4 w-4" />
                          {t('team.saveBio')}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="relative text-left">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={startEditBio}
                          className="absolute -right-1 -top-1 rounded-full p-1.5 text-forest-500 transition-colors hover:bg-forest-100 hover:text-forest-700 dark:text-gold-400 dark:hover:bg-forest-800 dark:hover:text-gold-300"
                          aria-label={t('team.editBio')}
                          title={t('team.editBio')}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      <p className="pr-8 text-sm leading-relaxed text-muted">{detail.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {staffTeam && (
        <div
          className="animate-fade-in fixed inset-0 z-[110] flex items-center justify-center bg-forest-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="staff-team-title"
          onClick={() => setStaffTeam(null)}
        >
          <div
            className="relative flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl dark:bg-forest-900 dark:ring-1 dark:ring-forest-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-earth-100 px-6 pb-4 pt-6 dark:border-forest-800">
              <button
                type="button"
                onClick={() => setStaffTeam(null)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-earth-500 hover:bg-earth-100 dark:text-forest-300 dark:hover:bg-forest-800"
                aria-label={t('auth.close')}
              >
                <Close className="h-5 w-5" />
              </button>
              <p className="text-xs font-bold uppercase tracking-wider text-forest-600 dark:text-gold-400">
                {t('team.teamMembers')}
              </p>
              <h3 id="staff-team-title" className="mt-2 pr-8 font-display text-xl font-bold text-forest-900 dark:text-forest-50">
                {teamLabel(staffTeam)}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {teamMembers.length}{' '}
                {teamMembers.length === 1 ? t('common.member') : t('common.members')}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {teamMembers.length > 0 ? (
                <ul className="divide-y divide-earth-100 rounded-xl border border-earth-100 dark:divide-forest-800 dark:border-forest-800">
                  {teamMembers.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <span className="min-w-0 font-medium text-forest-800 dark:text-forest-100">
                        {formatPersonName(m.name) || '—'}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        {m.phone && (
                          <a
                            href={`tel:${String(m.phone).replace(/[^\d+]/g, '')}`}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-forest-700 hover:text-forest-900 hover:underline dark:text-forest-200 dark:hover:text-white"
                          >
                            <Phone className="h-3.5 w-3.5 text-forest-500" />
                            {formatPhone(m.phone)}
                          </a>
                        )}
                        {isAdmin && m.added && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTeamMember(m.id)}
                            className="text-earth-400 transition-colors hover:text-red-600"
                            aria-label={t('common.remove')}
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-earth-200 px-4 py-8 text-center text-sm text-muted dark:border-forest-700">
                  {t('common.noMembers')}
                </p>
              )}

              {isAdmin && (
                <form onSubmit={handleAddTeamMember} className="mt-4 rounded-xl border border-earth-100 bg-earth-50/60 p-3 dark:border-forest-800 dark:bg-forest-900/40">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-earth-500 dark:text-forest-400">
                    {t('common.addMember')}
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={memberForm.name}
                      onChange={(e) => setMemberForm((s) => ({ ...s, name: e.target.value }))}
                      placeholder={t('common.memberName')}
                      className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                    />
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={memberForm.phone}
                        onChange={(e) => setMemberForm((s) => ({ ...s, phone: e.target.value }))}
                        placeholder={t('common.memberPhone')}
                        className="min-w-0 flex-1 rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                      />
                      <button
                        type="submit"
                        disabled={!memberForm.name.trim()}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-forest-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-forest-500 dark:hover:bg-forest-400"
                      >
                        <Check className="h-4 w-4" /> {t('common.add')}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
