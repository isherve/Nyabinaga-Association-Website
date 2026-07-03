import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import PasswordModal from './PasswordModal'
import { ChevronDown, Check, Coins, Users, Lock, Phone, Trash, Upload } from './Icons'
import { formatRWF } from '../content/groups'
import { tp } from '../content/groupTranslations'
import { getGroupMembers, addGroupMember, addGroupMembersBulk, removeAddedMember, formatPhone } from '../content/members'
import { useRef, useState } from 'react'

export default function GroupCard({ group }) {
  const { t, lang } = useSettings()
  const { canViewDetails } = useAuth()
  const [open, setOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [askPassword, setAskPassword] = useState(false)
  const panelId = `group-panel-${group.id}`
  const membersPanelId = `group-members-${group.id}`

  // Public member list (name + phone) — visible to everyone, no password.
  const [members, setMembers] = useState(() => getGroupMembers(group.id))
  const [form, setForm] = useState({ name: '', phone: '', role: '' })
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef(null)

  const handleAddMember = (e) => {
    e.preventDefault()
    if (!form.name.trim() && !form.phone.trim()) return
    setMembers(addGroupMember(group.id, form))
    setForm({ name: '', phone: '', role: '' })
  }

  const handleRemoveMember = (id) => {
    setMembers(removeAddedMember(group.id, id))
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (fileRef.current) fileRef.current.value = ''
    if (!file) return
    setImportMsg('')
    try {
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
      const parsed = rows
        .map((row) => {
          const lower = {}
          Object.entries(row).forEach(([k, v]) => { lower[String(k).trim().toLowerCase()] = v })
          return {
            name: lower.name || lower['full name'] || lower.names || lower.member || lower.amazina || '',
            phone: lower.phone || lower['phone number'] || lower.tel || lower.telephone || lower.nimero || '',
            role: lower.role || lower.position || lower.inshingano || '',
          }
        })
        .filter((m) => String(m.name).trim() || String(m.phone).trim())
      if (parsed.length === 0) {
        setImportMsg(t('common.importNone'))
        return
      }
      const { members: next, added } = addGroupMembersBulk(group.id, parsed)
      setMembers(next)
      setImportMsg(`${added} ${t('common.importDone')}`)
    } catch {
      setImportMsg(t('common.importError'))
    }
  }

  const handleToggle = () => {
    if (open) {
      setOpen(false)
      return
    }
    if (canViewDetails) setOpen(true)
    else setAskPassword(true)
  }

  return (
    <article className="card flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={group.image}
          alt={group.name}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        {group.registered && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-forest-700 shadow dark:bg-forest-900/95 dark:text-forest-100">
            <Check className="h-3.5 w-3.5 text-forest-600 dark:text-gold-400" /> {t('common.registered')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap gap-2">
          {group.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-medium text-forest-700 dark:bg-forest-800 dark:text-forest-200"
            >
              {tp(tag, lang)}
            </span>
          ))}
        </div>

        <h3 className="mt-3 font-display text-xl font-bold text-forest-900 dark:text-forest-50">
          {group.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-gold-600 dark:text-gold-400">{tp(group.activity, lang)}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{tp(group.highlight, lang)}</p>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {group.totalAssets > 0 && (
            <span className="inline-flex items-center gap-2 text-forest-800 dark:text-forest-100">
              <Coins className="h-4 w-4 text-gold-500" />
              <span className="font-semibold">
                {formatRWF(group.totalAssets, lang)}
                {group.approximate ? ` ${t('common.approx')}` : ''}
              </span>
            </span>
          )}
          {group.members && (
            <span className="inline-flex items-center gap-2 text-muted">
              <Users className="h-4 w-4 text-forest-500" />
              {group.members} {t('common.members')}
            </span>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleToggle}
            aria-expanded={open}
            aria-controls={panelId}
            className="inline-flex items-center gap-1.5 rounded-full bg-earth-100 px-4 py-2 text-sm font-semibold text-forest-700 transition-colors hover:bg-earth-200 dark:bg-forest-800 dark:text-forest-100 dark:hover:bg-forest-700"
          >
            {open ? (
              <>
                {t('common.hideDetails')}
                <ChevronDown className="h-4 w-4 rotate-180 transition-transform duration-300" />
              </>
            ) : canViewDetails ? (
              <>
                {t('common.viewDetails')}
                <ChevronDown className="h-4 w-4 transition-transform duration-300" />
              </>
            ) : (
              <>
                {t('common.viewDetails')}
                <Lock className="h-4 w-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMembersOpen((v) => !v)}
            aria-expanded={membersOpen}
            aria-controls={membersPanelId}
            className="inline-flex items-center gap-1.5 rounded-full bg-forest-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-700 dark:bg-forest-500 dark:hover:bg-forest-400"
          >
            <Users className="h-4 w-4" />
            {t('common.memberList')}
            {members.length > 0 && <span className="ml-0.5 rounded-full bg-white/20 px-1.5 text-xs">{members.length}</span>}
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${membersOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Members panel — public, no password required. Opens straight to a form. */}
        <div
          id={membersPanelId}
          className={`grid transition-all duration-300 ease-out ${
            membersOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            {/* Add member form */}
            <form onSubmit={handleAddMember} className="rounded-xl border border-earth-100 bg-earth-50/60 p-3 dark:border-forest-800 dark:bg-forest-900/40">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-earth-500 dark:text-forest-400">
                  {t('common.addMember')}
                </p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-forest-300 px-2.5 py-1 text-xs font-semibold text-forest-700 transition-colors hover:bg-forest-50 dark:border-forest-600 dark:text-forest-200 dark:hover:bg-forest-800"
                >
                  <Upload className="h-3.5 w-3.5" /> {t('common.importExcel')}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImport}
                  className="hidden"
                />
              </div>
              {importMsg && (
                <p className="mb-2 text-xs font-medium text-forest-600 dark:text-gold-300">{importMsg}</p>
              )}
              <div className="space-y-2">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder={t('common.memberName')}
                  className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                />
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                    placeholder={t('common.memberPhone')}
                    className="min-w-0 flex-1 rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                  />
                  <button
                    type="submit"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-forest-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-700 dark:bg-forest-500 dark:hover:bg-forest-400"
                  >
                    <Check className="h-4 w-4" /> {t('common.add')}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-[11px] leading-snug text-earth-500 dark:text-forest-400">{t('common.importHint')}</p>
            </form>

            {/* Existing member list */}
            {members.length > 0 && (
              <ul className="mt-3 max-h-56 divide-y divide-earth-100 overflow-y-auto rounded-xl border border-earth-100 dark:divide-forest-800 dark:border-forest-800">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                    <span className="min-w-0 truncate text-forest-800 dark:text-forest-100">
                      {m.name || '—'}
                      {m.role && <span className="ml-1.5 text-xs text-earth-500 dark:text-forest-400">· {m.role}</span>}
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
                      {m.added && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.id)}
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
            )}
          </div>
        </div>

        <PasswordModal
          open={askPassword}
          mode="details"
          onClose={() => setAskPassword(false)}
          onSuccess={() => setOpen(true)}
        />

        <div
          id={panelId}
          className={`grid transition-all duration-300 ease-out ${
            open ? 'mt-5 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <p className="text-sm leading-relaxed text-muted">{tp(group.details, lang)}</p>

            {group.savings && (
              <p className="mt-4 rounded-xl bg-forest-50 px-4 py-3 text-sm text-forest-800 dark:bg-forest-800 dark:text-forest-100">
                <strong>{t('common.savings')}:</strong> {tp(group.savings, lang)}
              </p>
            )}

            {group.breakdown?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-earth-500 dark:text-forest-400">
                  {t('common.assetsBreakdown')}
                </h4>
                <ul className="mt-2 divide-y divide-earth-100 rounded-xl border border-earth-100 dark:divide-forest-800 dark:border-forest-800">
                  {group.breakdown.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center justify-between gap-4 px-4 py-2 text-sm"
                    >
                      <span className="text-muted">{tp(item.label, lang)}</span>
                      <span className="whitespace-nowrap font-semibold text-forest-800 dark:text-forest-100">
                        {formatRWF(item.value, lang)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {group.totalAssets > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-forest-600 px-4 py-3 text-white dark:bg-forest-500">
                <span className="text-sm font-medium">{t('common.totalGroupAssets')}</span>
                <span className="font-display text-lg font-bold">
                  {formatRWF(group.totalAssets, lang)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
