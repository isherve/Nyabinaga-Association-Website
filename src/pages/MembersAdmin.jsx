import { useMemo, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import PageHeader from '../components/PageHeader'
import PasswordModal from '../components/PasswordModal'
import { useAuth } from '../context/AuthContext'
import { featuredImages } from '../content/site'
import { groups } from '../content/groups'
import { Lock, Users, Upload, Download, Trash, Check, Close, Phone } from '../components/Icons'
import {
  getAllMembers,
  getGroupMembers,
  addMember,
  updateMember,
  removeMember,
  replaceGroupMembers,
  clearGroupMembers,
  formatPhone,
} from '../lib/membersStore'

const inputCls =
  'w-full rounded-xl border border-earth-200 bg-earth-50 px-3 py-2 text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50'

export default function MembersAdmin() {
  const { isAdmin } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  const [activeGroupId, setActiveGroupId] = useState(groups[0]?.id || '')
  const [version, setVersion] = useState(0) // bump to re-read from store
  const [draft, setDraft] = useState({ name: '', phone: '', role: '' })
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState({ name: '', phone: '', role: '' })
  const [importError, setImportError] = useState('')
  const fileRef = useRef(null)

  const refresh = () => setVersion((v) => v + 1)

  const activeGroup = groups.find((g) => g.id === activeGroupId)
  const members = useMemo(() => getGroupMembers(activeGroupId), [activeGroupId, version])
  const counts = useMemo(() => {
    const all = getAllMembers()
    const map = {}
    for (const m of all) map[m.groupId] = (map[m.groupId] || 0) + 1
    return map
  }, [version])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!draft.name.trim() && !draft.phone.trim()) return
    addMember({ ...draft, groupId: activeGroupId })
    setDraft({ name: '', phone: '', role: '' })
    refresh()
  }

  const startEdit = (m) => {
    setEditingId(m.id)
    setEditDraft({ name: m.name, phone: m.phone, role: m.role })
  }

  const saveEdit = () => {
    updateMember(editingId, editDraft)
    setEditingId(null)
    refresh()
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (fileRef.current) fileRef.current.value = ''
    if (!file) return
    setImportError('')
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
      const parsed = rows
        .map((row) => {
          const lower = {}
          Object.entries(row).forEach(([k, v]) => { lower[String(k).trim().toLowerCase()] = v })
          return {
            name: lower.name || lower['full name'] || lower.member || '',
            phone: lower.phone || lower['phone number'] || lower.tel || lower.telephone || '',
            role: lower.role || lower.position || '',
          }
        })
        .filter((m) => String(m.name).trim() || String(m.phone).trim())
      if (parsed.length === 0) {
        setImportError('No rows with a Name or Phone column were found.')
        return
      }
      if (!confirm(`Replace the ${members.length} current member(s) of "${activeGroup?.name}" with ${parsed.length} imported row(s)?`)) return
      replaceGroupMembers(activeGroupId, parsed)
      refresh()
    } catch (err) {
      setImportError(err?.message || 'Could not read that file.')
    }
  }

  const exportExcel = () => {
    const rows = members.map((m) => ({ Name: m.name, Phone: m.phone, Role: m.role }))
    const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Name: '', Phone: '', Role: '' }], {
      header: ['Name', 'Phone', 'Role'],
    })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Members')
    const safe = (activeGroup?.name || 'group').replace(/[^\w]+/g, '-').toLowerCase()
    XLSX.writeFile(wb, `nyabinaga-members-${safe}.xlsx`)
  }

  if (!isAdmin) {
    return (
      <>
        <PageHeader eyebrow="Admin" title="Group Members" subtitle="Manage the member list (name & phone number) for each livelihood group." image={featuredImages.groups} />
        <section className="section">
          <div className="container-page">
            <div className="card mx-auto max-w-md p-10 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
                <Lock className="h-8 w-8" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold text-forest-900 dark:text-forest-50">Administrators only</h2>
              <p className="mt-2 text-muted">Member phone numbers are private. Please sign in to manage them.</p>
              <button type="button" onClick={() => setLoginOpen(true)} className="btn-primary mx-auto mt-6">
                <Lock className="h-4 w-4" /> Admin sign in
              </button>
            </div>
          </div>
        </section>
        <PasswordModal open={loginOpen} mode="admin" onClose={() => setLoginOpen(false)} />
      </>
    )
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Group Members" subtitle="Manage the member list (name & phone number) for each livelihood group." image={featuredImages.groups} />

      <section className="section">
        <div className="container-page">
          <div className="grid gap-6 lg:grid-cols-[18rem,1fr]">
            {/* Group selector */}
            <aside className="card h-max p-3">
              <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-earth-500 dark:text-forest-400">Groups</p>
              <ul className="max-h-[28rem] space-y-1 overflow-y-auto">
                {groups.map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => { setActiveGroupId(g.id); setEditingId(null) }}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        g.id === activeGroupId
                          ? 'bg-forest-600 text-white'
                          : 'text-forest-700 hover:bg-earth-100 dark:text-forest-100 dark:hover:bg-forest-800'
                      }`}
                    >
                      <span className="truncate font-medium">{g.name}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        g.id === activeGroupId ? 'bg-white/20 text-white' : 'bg-earth-100 text-earth-600 dark:bg-forest-800 dark:text-forest-300'
                      }`}>
                        {counts[g.id] || 0}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            {/* Members panel */}
            <div className="space-y-5">
              <div className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-bold text-forest-900 dark:text-forest-50">{activeGroup?.name}</h2>
                    <p className="text-sm text-muted">{members.length} member(s){activeGroup?.members ? ` · target ${activeGroup.members}` : ''}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline text-sm">
                      <Upload className="h-4 w-4" /> Import
                    </button>
                    <button type="button" onClick={exportExcel} disabled={!members.length} className="btn-outline text-sm disabled:opacity-40">
                      <Download className="h-4 w-4" /> Excel
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (members.length && confirm(`Remove ALL ${members.length} members of "${activeGroup?.name}"?`)) { clearGroupMembers(activeGroupId); refresh() } }}
                      disabled={!members.length}
                      className="rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
                {importError && <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">{importError}</p>}

                {/* Add member row */}
                <form onSubmit={handleAdd} className="mt-4 grid gap-2 sm:grid-cols-[1.4fr,1fr,1fr,auto]">
                  <input type="text" value={draft.name} onChange={(e) => setDraft((s) => ({ ...s, name: e.target.value }))} placeholder="Member name" className={inputCls} />
                  <input type="tel" value={draft.phone} onChange={(e) => setDraft((s) => ({ ...s, phone: e.target.value }))} placeholder="Phone (+250…)" className={inputCls} />
                  <input type="text" value={draft.role} onChange={(e) => setDraft((s) => ({ ...s, role: e.target.value }))} placeholder="Role (optional)" className={inputCls} />
                  <button type="submit" className="btn-primary shrink-0 text-sm">
                    <Check className="h-4 w-4" /> Add
                  </button>
                </form>
              </div>

              <div className="card p-0 overflow-hidden">
                {members.length === 0 ? (
                  <div className="py-14 text-center">
                    <Users className="mx-auto h-10 w-10 text-earth-400 dark:text-forest-600" />
                    <p className="mt-3 text-muted">No members yet for this group. Add them above or import a spreadsheet.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-earth-50 text-forest-700 dark:bg-forest-900 dark:text-forest-100">
                      <tr>
                        <th className="w-10 px-4 py-3 font-semibold">#</th>
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">Phone</th>
                        <th className="px-4 py-3 font-semibold">Role</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m, i) => (
                        <tr key={m.id} className="border-t border-earth-100 dark:border-forest-800">
                          <td className="px-4 py-2.5 font-mono text-earth-500 dark:text-forest-400">{i + 1}</td>
                          {editingId === m.id ? (
                            <>
                              <td className="px-4 py-2"><input value={editDraft.name} onChange={(e) => setEditDraft((s) => ({ ...s, name: e.target.value }))} className={inputCls} /></td>
                              <td className="px-4 py-2"><input value={editDraft.phone} onChange={(e) => setEditDraft((s) => ({ ...s, phone: e.target.value }))} className={inputCls} /></td>
                              <td className="px-4 py-2"><input value={editDraft.role} onChange={(e) => setEditDraft((s) => ({ ...s, role: e.target.value }))} className={inputCls} /></td>
                              <td className="whitespace-nowrap px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <button type="button" onClick={saveEdit} className="font-medium text-forest-600 hover:underline dark:text-gold-300">Save</button>
                                  <button type="button" onClick={() => setEditingId(null)} className="text-earth-500 hover:underline">Cancel</button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-2.5 font-medium text-forest-900 dark:text-forest-50">{m.name || <span className="text-earth-400">—</span>}</td>
                              <td className="px-4 py-2.5 font-mono text-forest-700 dark:text-forest-200">{formatPhone(m.phone) || <span className="text-earth-400">—</span>}</td>
                              <td className="px-4 py-2.5 text-muted">{m.role || <span className="text-earth-400">—</span>}</td>
                              <td className="whitespace-nowrap px-4 py-2.5">
                                <div className="flex items-center gap-3">
                                  <button type="button" onClick={() => startEdit(m)} className="font-medium text-forest-600 hover:underline dark:text-gold-300">Edit</button>
                                  <button type="button" onClick={() => { removeMember(m.id); refresh() }} className="text-earth-400 transition-colors hover:text-red-600" aria-label="Delete">
                                    <Trash className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <p className="flex items-start gap-2 text-xs text-muted">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                Import accepts a spreadsheet with <strong className="mx-1 font-semibold">Name</strong>, <strong className="mx-1 font-semibold">Phone</strong> and optional <strong className="mx-1 font-semibold">Role</strong> columns. Data is saved in this browser only.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
