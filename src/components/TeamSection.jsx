import { useEffect, useRef, useState } from 'react'
import Reveal from './Reveal'
import { staffRoles } from '../content/staff'
import { formatPhone } from '../content/members'
import {
  addStaffTeamMember,
  addStaffTeamMembersBulk,
  getStaffTeamMembers,
  removeAddedStaffTeamMember,
  updateStaffTeamMember,
} from '../content/staffTeamMembers'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { formatPersonName } from '../lib/formatPersonName'
import { getLeadership, updateLeaderLocal } from '../lib/leadershipStore'
import {
  addSharedStaffMember,
  addSharedStaffMembersBulk,
  compressImageToDataUrl,
  fetchSharedTeamData,
  isLocalDev,
  removeSharedStaffMember,
  syncLocalTeamDataToServer,
  updateSharedLeader,
  updateSharedStaffMember,
} from '../lib/teamClient'
import { Check, Close, Info, Pencil, Phone, Trash, Upload, Users } from './Icons'

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
  const [leadershipOverrides, setLeadershipOverrides] = useState(null)
  const [staffStore, setStaffStore] = useState(null)
  const [fromServer, setFromServer] = useState(false)
  const [detail, setDetail] = useState(null)
  const [editingBio, setEditingBio] = useState(false)
  const [bioDraft, setBioDraft] = useState('')
  const [photoMsg, setPhotoMsg] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)
  const [staffTeam, setStaffTeam] = useState(null)
  const [memberForm, setMemberForm] = useState({ name: '', phone: '' })
  const [editingMemberId, setEditingMemberId] = useState(null)
  const [editMemberForm, setEditMemberForm] = useState({ name: '', phone: '' })
  const [importMsg, setImportMsg] = useState('')
  const [saveError, setSaveError] = useState('')
  const [, setLocalTick] = useState(0)
  const photoInputRef = useRef(null)
  const importInputRef = useRef(null)

  const teamMembers = staffTeam
    ? getStaffTeamMembers(staffTeam.id, staffStore, fromServer)
    : []

  // Re-resolve from shared/local overrides whenever data changes.
  const displayLeaders = getLeadership(fromServer ? leadershipOverrides : null)
  const displayDirector = displayLeaders[0]
  const displayManagement = displayLeaders.slice(1)

  const modalOpen = Boolean(detail || staffTeam)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const data = await fetchSharedTeamData()
      if (cancelled) return
      setLeadershipOverrides(data.leadership)
      setStaffStore(data.staffTeams)
      setFromServer(data.shared)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isAdmin || !fromServer) return
    let cancelled = false
    syncLocalTeamDataToServer()
      .then((synced) => {
        if (!cancelled && synced) {
          setLeadershipOverrides(synced.leadership || {})
          setStaffStore(synced.staffTeams || {})
          setFromServer(true)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isAdmin, fromServer])

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
      setPhotoMsg('')
    }
  }, [detail])

  useEffect(() => {
    if (!staffTeam) {
      setEditingMemberId(null)
      setImportMsg('')
      setSaveError('')
    }
  }, [staffTeam])

  const refreshDetail = (updatedLeaders, name) => {
    const next = updatedLeaders.find((l) => l.name === name)
    if (next) setDetail(next)
  }

  const openDetail = (leader) => {
    setEditingBio(false)
    setBioDraft(leader.bio || '')
    setDetail(leader)
  }

  const saveBio = async () => {
    if (!detail) return
    setSaveError('')
    try {
      if (!isLocalDev() || fromServer) {
        const data = await updateSharedLeader(detail.name, { bio: bioDraft })
        setLeadershipOverrides(data.leadership)
        setFromServer(true)
        refreshDetail(getLeadership(data.leadership), detail.name)
        setEditingBio(false)
        return
      }
    } catch (err) {
      if (!isLocalDev()) {
        setSaveError(err.message || t('team.photoError'))
        return
      }
    }
    const updated = updateLeaderLocal(detail.name, { bio: bioDraft })
    setLocalTick((n) => n + 1)
    refreshDetail(updated, detail.name)
    setEditingBio(false)
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (photoInputRef.current) photoInputRef.current.value = ''
    if (!file || !detail || !isAdmin) return
    setPhotoBusy(true)
    setPhotoMsg('')
    setSaveError('')
    try {
      const dataUrl = await compressImageToDataUrl(file)
      if (!isLocalDev() || fromServer) {
        const data = await updateSharedLeader(detail.name, { photo: dataUrl })
        setLeadershipOverrides(data.leadership)
        setFromServer(true)
        refreshDetail(getLeadership(data.leadership), detail.name)
        setPhotoMsg(t('team.photoUpdated'))
      } else {
        const updated = updateLeaderLocal(detail.name, { photo: dataUrl })
        setLocalTick((n) => n + 1)
        refreshDetail(updated, detail.name)
        setPhotoMsg(t('team.photoUpdated'))
      }
    } catch (err) {
      setPhotoMsg(err.message || t('team.photoError'))
    } finally {
      setPhotoBusy(false)
    }
  }

  const teamLabel = (team) => (team.roleKey ? t(team.roleKey) : team.role)

  const openStaffTeam = (team) => {
    setStaffTeam(team)
    setMemberForm({ name: '', phone: '' })
    setEditingMemberId(null)
    setImportMsg('')
    setSaveError('')
  }

  const memberCount = (team) => {
    const count = getStaffTeamMembers(team.id, staffStore, fromServer).length
    return count || team.number
  }

  const handleAddTeamMember = async (e) => {
    e.preventDefault()
    if (!staffTeam || !isAdmin || !memberForm.name.trim()) return
    setSaveError('')
    setImportMsg('')
    try {
      if (!isLocalDev() || fromServer) {
        const data = await addSharedStaffMember(staffTeam.id, memberForm)
        setStaffStore(data.staffTeams)
        setFromServer(true)
        setMemberForm({ name: '', phone: '' })
        setImportMsg(t('common.membersShared'))
        return
      }
    } catch (err) {
      if (!isLocalDev()) {
        setSaveError(err.message || 'Failed to save member')
        return
      }
    }
    addStaffTeamMember(staffTeam.id, memberForm)
    setLocalTick((n) => n + 1)
    setMemberForm({ name: '', phone: '' })
  }

  const handleRemoveTeamMember = async (id) => {
    if (!staffTeam) return
    if (editingMemberId === id) setEditingMemberId(null)
    try {
      if (!isLocalDev() || fromServer) {
        const data = await removeSharedStaffMember(staffTeam.id, id)
        setStaffStore(data.staffTeams)
        return
      }
    } catch (err) {
      if (!isLocalDev()) {
        setSaveError(err.message || 'Failed to remove')
        return
      }
    }
    removeAddedStaffTeamMember(staffTeam.id, id)
    setLocalTick((n) => n + 1)
  }

  const startEditMember = (m) => {
    setEditingMemberId(m.id)
    setEditMemberForm({ name: m.name || '', phone: m.phone || '' })
  }

  const cancelEditMember = () => {
    setEditingMemberId(null)
    setEditMemberForm({ name: '', phone: '' })
  }

  const handleSaveMemberEdit = async (id) => {
    if (!staffTeam || !isAdmin) return
    setSaveError('')
    try {
      if (!isLocalDev() || fromServer) {
        const data = await updateSharedStaffMember(staffTeam.id, id, editMemberForm)
        setStaffStore(data.staffTeams)
        setEditingMemberId(null)
        return
      }
    } catch (err) {
      if (!isLocalDev()) {
        setSaveError(err.message || 'Failed to update')
        return
      }
    }
    updateStaffTeamMember(staffTeam.id, id, editMemberForm)
    setLocalTick((n) => n + 1)
    setEditingMemberId(null)
  }

  const handleImportMembers = async (e) => {
    const file = e.target.files?.[0]
    if (importInputRef.current) importInputRef.current.value = ''
    if (!file || !staffTeam || !isAdmin) return
    setImportMsg('')
    setSaveError('')
    try {
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
      const parsed = rows
        .map((row) => {
          const lower = {}
          Object.entries(row).forEach(([k, v]) => {
            lower[String(k).trim().toLowerCase()] = v
          })
          return {
            name: lower.name || lower['full name'] || lower.names || lower.member || lower.amazina || '',
            phone: lower.phone || lower['phone number'] || lower.tel || lower.telephone || lower.nimero || '',
            role: lower.role || lower.position || lower.inshingano || '',
          }
        })
        .filter((m) => String(m.name).trim() || String(m.phone).trim())
      if (!parsed.length) {
        setImportMsg(t('common.importNone'))
        return
      }

      try {
        if (!isLocalDev() || fromServer) {
          const data = await addSharedStaffMembersBulk(staffTeam.id, parsed)
          setStaffStore(data.staffTeams)
          setFromServer(true)
          setImportMsg(`${parsed.length} ${t('common.importDone')} ${t('common.membersShared')}`)
          return
        }
      } catch (err) {
        if (!isLocalDev()) {
          setSaveError(err.message || t('common.importError'))
          return
        }
      }

      const { added } = addStaffTeamMembersBulk(staffTeam.id, parsed)
      setLocalTick((n) => n + 1)
      setImportMsg(`${added} ${t('common.importDone')} (${t('common.membersLocalOnly')})`)
    } catch (err) {
      setImportMsg(err?.message ? `${t('common.importError')} — ${err.message}` : t('common.importError'))
    }
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

        {displayDirector && (
          <Reveal className="mt-12">
            <article className="card mx-auto max-w-4xl overflow-hidden">
              <div className="flex flex-col items-center gap-8 p-8 text-center sm:flex-row sm:p-10 sm:text-left">
                <TeamPhoto leader={displayDirector} className="h-44 w-44 sm:h-48 sm:w-48" />
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-full bg-forest-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest-700 dark:bg-forest-800 dark:text-gold-300">
                    {t('team.director.eyebrow')}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-bold tracking-wide text-forest-900 dark:text-forest-50 sm:text-3xl">
                    {formatPersonName(displayDirector.name)}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <p className="text-lg font-semibold text-forest-600 dark:text-gold-400">{displayDirector.role}</p>
                    {displayDirector.bio && (
                      <button
                        type="button"
                        onClick={() => openDetail(displayDirector)}
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

        {displayManagement.length > 0 && (
          <>
            <div className="mb-8 mt-14 rounded-2xl bg-forest-800 px-6 py-3.5 text-center dark:bg-forest-950">
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white sm:text-base">
                {t('team.management.title')}
              </h3>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {displayManagement.map((leader, i) => (
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
              <div className="relative">
                <TeamPhoto leader={detail} className="h-28 w-28" />
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={photoBusy}
                      className="absolute -bottom-1 -right-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-forest-700 text-white shadow-md transition-colors hover:bg-forest-800 disabled:opacity-60 dark:bg-gold-500 dark:text-forest-950 dark:hover:bg-gold-400"
                      aria-label={t('team.changePhoto')}
                      title={t('team.changePhoto')}
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </>
                )}
              </div>
              {photoMsg && (
                <p className="mt-3 text-xs font-medium text-forest-600 dark:text-gold-300">{photoMsg}</p>
              )}
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
                          onClick={() => {
                            setBioDraft(detail.bio || '')
                            setEditingBio(false)
                          }}
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
                          onClick={() => {
                            setBioDraft(detail.bio || '')
                            setEditingBio(true)
                          }}
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
              {saveError && <p className="mt-3 text-xs font-medium text-red-600">{saveError}</p>}
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
                <ul className="max-h-[28rem] divide-y divide-earth-100 overflow-y-auto rounded-xl border border-earth-100 dark:divide-forest-800 dark:border-forest-800">
                  {teamMembers.map((m) => (
                    <li key={m.id} className="px-4 py-3 text-sm">
                      {editingMemberId === m.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editMemberForm.name}
                            onChange={(e) => setEditMemberForm((s) => ({ ...s, name: e.target.value }))}
                            placeholder={t('common.memberName')}
                            className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                            autoFocus
                          />
                          <input
                            type="tel"
                            value={editMemberForm.phone}
                            onChange={(e) => setEditMemberForm((s) => ({ ...s, phone: e.target.value }))}
                            placeholder={t('common.memberPhone')}
                            className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={cancelEditMember}
                              className="rounded-lg border border-earth-200 px-3 py-1.5 text-xs font-medium text-forest-700 hover:bg-earth-100 dark:border-forest-700 dark:text-forest-200 dark:hover:bg-forest-800"
                            >
                              {t('common.cancelEdit')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveMemberEdit(m.id)}
                              disabled={!editMemberForm.name.trim()}
                              className="inline-flex items-center gap-1 rounded-lg bg-forest-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest-700 disabled:opacity-50 dark:bg-forest-500"
                            >
                              <Check className="h-3.5 w-3.5" />
                              {t('common.saveChanges')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="break-words font-medium leading-snug text-forest-800 dark:text-forest-100">
                              {formatPersonName(m.name) || '—'}
                            </p>
                            {m.phone && (
                              <a
                                href={`tel:${String(m.phone).replace(/[^\d+]/g, '')}`}
                                className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-xs text-forest-700 hover:underline dark:text-forest-200"
                              >
                                <Phone className="h-3.5 w-3.5 shrink-0 text-forest-500" />
                                {formatPhone(m.phone)}
                              </a>
                            )}
                          </div>
                          {isAdmin && m.added && (
                            <span className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => startEditMember(m)}
                                className="rounded-full p-1.5 text-forest-500 hover:bg-forest-100 hover:text-forest-700 dark:text-gold-400 dark:hover:bg-forest-800"
                                aria-label={t('common.edit')}
                                title={t('common.edit')}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveTeamMember(m.id)}
                                className="rounded-full p-1.5 text-earth-400 hover:bg-red-50 hover:text-red-600"
                                aria-label={t('common.remove')}
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </span>
                          )}
                        </div>
                      )}
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
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-earth-500 dark:text-forest-400">
                      {t('common.addMember')}
                    </p>
                    <button
                      type="button"
                      onClick={() => importInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-forest-300 px-2.5 py-1 text-xs font-semibold text-forest-700 hover:bg-forest-50 dark:border-forest-600 dark:text-forest-200 dark:hover:bg-forest-800"
                    >
                      <Upload className="h-3.5 w-3.5" /> {t('common.importExcel')}
                    </button>
                    <input
                      ref={importInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleImportMembers}
                    />
                  </div>
                  {importMsg && (
                    <p className="mb-2 text-xs font-medium text-forest-600 dark:text-gold-300">{importMsg}</p>
                  )}
                  {saveError && (
                    <p className="mb-2 text-xs font-medium text-red-600 dark:text-red-400">{saveError}</p>
                  )}
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
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-forest-600 px-3 py-2 text-sm font-semibold text-white hover:bg-forest-700 disabled:opacity-50 dark:bg-forest-500"
                      >
                        <Check className="h-4 w-4" /> {t('common.add')}
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-earth-500 dark:text-forest-400">{t('common.importHint')}</p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
