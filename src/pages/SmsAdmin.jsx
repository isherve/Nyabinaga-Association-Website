import { useMemo, useRef, useState } from 'react'
import PageHeader from '../components/PageHeader'
import PasswordModal from '../components/PasswordModal'
import { useAuth } from '../context/AuthContext'
import { featuredImages } from '../content/site'
import { Lock, Message, Send, Upload, Download, Trash, Check, Close, Users, Phone } from '../components/Icons'
import { normalizePhone, formatPhoneDisplay, smsSegments } from '../lib/phone'
import { sendSms } from '../lib/smsClient'
import {
  getContacts,
  mergeContacts,
  addContact,
  removeContact,
  clearContacts,
  saveContacts,
  getHistory,
  addHistory,
  updateHistory,
  clearHistory,
} from '../lib/smsStore'
import {
  parseContactsFile,
  exportContacts,
  exportHistory,
  downloadTemplate,
} from '../lib/contactsIO'

const SEND_PW_KEY = 'nyabinaga_sms_send_pw'

function StatusPill({ status }) {
  const map = {
    sent: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] || map.pending}`}>
      {status}
    </span>
  )
}

export default function SmsAdmin() {
  const { isAdmin } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  const [contacts, setContacts] = useState(() => getContacts())
  const [history, setHistory] = useState(() => getHistory())
  const [selected, setSelected] = useState(() => new Set())
  const [search, setSearch] = useState('')

  const [message, setMessage] = useState('')
  const [addForm, setAddForm] = useState({ name: '', phone: '' })
  const [addError, setAddError] = useState('')

  const [preview, setPreview] = useState(null) // { valid, invalid, fileName }
  const [importError, setImportError] = useState('')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sendPw, setSendPw] = useState(() => {
    try {
      return localStorage.getItem(SEND_PW_KEY) || ''
    } catch {
      return ''
    }
  })
  const [pwSaved, setPwSaved] = useState(() => {
    try {
      return !!localStorage.getItem(SEND_PW_KEY)
    } catch {
      return false
    }
  })
  const [editingPw, setEditingPw] = useState(false)
  const [progress, setProgress] = useState(null) // { total, done, current, sent, failed, running }

  const forgetPw = () => {
    try {
      localStorage.removeItem(SEND_PW_KEY)
    } catch {
      /* ignore */
    }
    setSendPw('')
    setPwSaved(false)
    setEditingPw(true)
  }

  const fileRef = useRef(null)

  const persistContacts = (next) => {
    setContacts(next)
    saveContacts(next)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q.replace(/\s/g, '')),
    )
  }, [contacts, search])

  const selectedContacts = useMemo(() => contacts.filter((c) => selected.has(c.id)), [contacts, selected])
  const segments = smsSegments(message)

  /* --------------------------- selection --------------------------- */
  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const allFilteredSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id))
  const toggleAllFiltered = () =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) filtered.forEach((c) => next.delete(c.id))
      else filtered.forEach((c) => next.add(c.id))
      return next
    })

  /* ----------------------------- add ------------------------------- */
  const handleAdd = (e) => {
    e.preventDefault()
    setAddError('')
    const n = normalizePhone(addForm.phone)
    if (!n.valid) {
      setAddError(n.reason || 'Invalid phone number')
      return
    }
    const { contacts: next, added } = addContact(contacts, addForm.name, addForm.phone)
    if (!added) {
      setAddError('That number is already in your contacts.')
      return
    }
    persistContacts(next)
    setAddForm({ name: '', phone: '' })
  }

  /* ---------------------------- import ----------------------------- */
  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (fileRef.current) fileRef.current.value = ''
    if (!file) return
    setImportError('')
    try {
      const result = await parseContactsFile(file)
      if (result.total === 0) {
        setImportError('No rows found in that file.')
        return
      }
      setPreview({ ...result, fileName: file.name })
    } catch (err) {
      setImportError(err?.message || 'Could not read that file.')
    }
  }

  const confirmImport = () => {
    if (!preview) return
    const { contacts: next } = mergeContacts(contacts, preview.valid)
    persistContacts(next)
    setPreview(null)
  }

  /* ----------------------------- send ------------------------------ */
  const openConfirm = () => {
    if (selectedContacts.length === 0 || !message.trim()) return
    setConfirmOpen(true)
  }

  const runSend = async () => {
    const recipients = selectedContacts
    setConfirmOpen(false)
    setEditingPw(false)
    // Remember the password on this device so future sends are one click.
    try {
      localStorage.setItem(SEND_PW_KEY, sendPw)
      setPwSaved(true)
    } catch {
      /* ignore */
    }

    let done = 0
    let sent = 0
    let failed = 0
    let badPassword = false
    setProgress({ total: recipients.length, done: 0, current: '', sent: 0, failed: 0, running: true })

    const batchId = Date.now().toString(36)

    for (const c of recipients) {
      setProgress((p) => ({ ...p, current: c.name || formatPhoneDisplay(c.phone), done }))

      const { history: withPending, record } = addHistory({
        phone: c.phone,
        name: c.name,
        message,
        status: 'pending',
        batchId,
      })
      setHistory(withPending)

      const result = await sendSms({ to: c.phone, message, password: sendPw })

      const updated = updateHistory(record.id, { status: result.status, response: result.response, messageId: result.messageId })
      setHistory(updated)

      done += 1
      if (result.ok) sent += 1
      else failed += 1
      setProgress((p) => ({ ...p, done, sent, failed }))

      // A rejected password will fail every recipient — stop early and clear it
      // so the user is prompted to re-enter next time.
      if (result.code === 401) {
        badPassword = true
        break
      }

      // Gentle pacing to respect gateway limits.
      await new Promise((r) => setTimeout(r, 250))
    }

    if (badPassword) {
      try {
        localStorage.removeItem(SEND_PW_KEY)
      } catch {
        /* ignore */
      }
      setPwSaved(false)
      setEditingPw(true)
    }

    setProgress((p) => ({ ...p, current: '', running: false, done, sent, failed, badPassword }))
  }

  /* --------------------------- not admin --------------------------- */
  if (!isAdmin) {
    return (
      <>
        <PageHeader eyebrow="Admin" title="SMS Center" subtitle="Send text messages to members and contacts." image={featuredImages.contact} />
        <section className="section">
          <div className="container-page">
            <div className="card mx-auto max-w-md p-10 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
                <Lock className="h-8 w-8" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold text-forest-900 dark:text-forest-50">Administrators only</h2>
              <p className="mt-2 text-muted">Please sign in as an administrator to access the SMS Center.</p>
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

  /* ----------------------------- admin ----------------------------- */
  return (
    <>
      <PageHeader eyebrow="Admin" title="SMS Center" subtitle="Send text messages directly to mobile phones." image={featuredImages.contact} />

      <section className="section">
        <div className="container-page space-y-8">
          {/* Setup notice */}
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700/60 dark:bg-amber-900/20 dark:text-amber-200">
            <strong>Live delivery requires setup.</strong> Add your SMS gateway credentials and an{' '}
            <code className="rounded bg-black/10 px-1">SMS_SEND_PASSWORD</code> in Vercel (see{' '}
            <code className="rounded bg-black/10 px-1">SMS_SETUP.md</code>). Until then, sends will return an error and be
            logged as <em>failed</em>. Numbers auto-convert to <strong>+250</strong> and are validated before sending.
          </div>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Compose */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-forest-900 dark:text-forest-50">
                  <Message className="h-5 w-5 text-forest-600 dark:text-gold-400" /> Compose message
                </h2>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hello, your appointment is confirmed."
                  className="mt-4 w-full resize-y rounded-xl border border-earth-200 bg-earth-50 px-4 py-3 text-forest-900 focus:border-forest-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-200 dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-earth-500 dark:text-forest-400">
                  <span>{message.length} characters</span>
                  <span>{segments} SMS {segments === 1 ? 'part' : 'parts'} / recipient</span>
                </div>

                <div className="mt-5 rounded-xl bg-forest-50 p-4 dark:bg-forest-900/60">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold text-forest-800 dark:text-forest-100">
                      <Users className="h-4 w-4" /> Recipients selected
                    </span>
                    <span className="rounded-full bg-forest-600 px-3 py-1 text-sm font-bold text-white">{selectedContacts.length}</span>
                  </div>
                  <button
                    type="button"
                    onClick={openConfirm}
                    disabled={selectedContacts.length === 0 || !message.trim() || progress?.running}
                    className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" /> Send SMS
                  </button>
                </div>
              </div>

              {/* Add single contact */}
              <div className="card p-6">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-forest-900 dark:text-forest-50">
                  <Phone className="h-5 w-5 text-forest-600 dark:text-gold-400" /> Add a contact
                </h3>
                <form onSubmit={handleAdd} className="mt-4 space-y-3">
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Full name (optional)"
                    className="w-full rounded-xl border border-earth-200 bg-earth-50 px-4 py-2.5 text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                  />
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="e.g. 0781011343 or +250781011343"
                    className="w-full rounded-xl border border-earth-200 bg-earth-50 px-4 py-2.5 text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                  />
                  {addError && <p className="text-sm font-medium text-red-600 dark:text-red-400">{addError}</p>}
                  <button type="submit" className="btn-outline w-full">Add contact</button>
                </form>

                <div className="mt-5 border-t border-earth-100 pt-5 dark:border-forest-800">
                  <p className="text-sm font-semibold text-forest-800 dark:text-forest-100">Import from Excel / CSV</p>
                  <p className="mt-1 text-xs text-earth-500 dark:text-forest-400">Columns: <strong>Full Name</strong>, <strong>Phone Number</strong></p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline text-sm">
                      <Upload className="h-4 w-4" /> Import file
                    </button>
                    <button type="button" onClick={downloadTemplate} className="btn-outline text-sm">
                      <Download className="h-4 w-4" /> Template
                    </button>
                  </div>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
                  {importError && <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">{importError}</p>}
                </div>
              </div>
            </div>

            {/* Contacts table */}
            <div className="lg:col-span-3">
              <div className="card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-forest-900 dark:text-forest-50">
                    <Users className="h-5 w-5 text-forest-600 dark:text-gold-400" /> Contacts
                    <span className="rounded-full bg-earth-100 px-2.5 py-0.5 text-sm font-semibold text-forest-700 dark:bg-forest-800 dark:text-forest-100">{contacts.length}</span>
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => exportContacts(selectedContacts.length ? selectedContacts : contacts, 'xlsx')} disabled={!contacts.length} className="btn-outline text-sm disabled:opacity-40">
                      <Download className="h-4 w-4" /> Excel
                    </button>
                    <button type="button" onClick={() => exportContacts(selectedContacts.length ? selectedContacts : contacts, 'csv')} disabled={!contacts.length} className="btn-outline text-sm disabled:opacity-40">
                      <Download className="h-4 w-4" /> CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete ALL contacts? This cannot be undone.')) {
                          persistContacts(clearContacts())
                          setSelected(new Set())
                        }
                      }}
                      disabled={!contacts.length}
                      className="rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or number…"
                  className="mt-4 w-full rounded-xl border border-earth-200 bg-earth-50 px-4 py-2.5 text-sm text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                />

                {contacts.length === 0 ? (
                  <div className="mt-8 rounded-2xl border-2 border-dashed border-earth-200 py-12 text-center dark:border-forest-800">
                    <Users className="mx-auto h-10 w-10 text-earth-400 dark:text-forest-600" />
                    <p className="mt-3 text-muted">No contacts yet. Add one or import a spreadsheet.</p>
                  </div>
                ) : (
                  <div className="mt-4 max-h-[28rem] overflow-y-auto rounded-xl border border-earth-100 dark:border-forest-800">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-earth-50 text-forest-700 dark:bg-forest-900 dark:text-forest-100">
                        <tr>
                          <th className="w-10 p-3">
                            <input type="checkbox" checked={allFilteredSelected} onChange={toggleAllFiltered} className="h-4 w-4 accent-forest-600" />
                          </th>
                          <th className="p-3 font-semibold">Name</th>
                          <th className="p-3 font-semibold">Phone (E.164)</th>
                          <th className="w-10 p-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((c) => (
                          <tr key={c.id} className="border-t border-earth-100 hover:bg-earth-50/60 dark:border-forest-800 dark:hover:bg-forest-900/40">
                            <td className="p-3">
                              <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} className="h-4 w-4 accent-forest-600" />
                            </td>
                            <td className="p-3 text-forest-900 dark:text-forest-50">{c.name || <span className="text-earth-400">—</span>}</td>
                            <td className="p-3 font-mono text-forest-700 dark:text-forest-200">{formatPhoneDisplay(c.phone)}</td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => {
                                  persistContacts(removeContact(contacts, c.id))
                                  setSelected((prev) => {
                                    const n = new Set(prev)
                                    n.delete(c.id)
                                    return n
                                  })
                                }}
                                className="text-earth-400 transition-colors hover:text-red-600"
                                aria-label="Delete contact"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* History */}
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-forest-900 dark:text-forest-50">
                <Message className="h-5 w-5 text-forest-600 dark:text-gold-400" /> SMS history
                <span className="rounded-full bg-earth-100 px-2.5 py-0.5 text-sm font-semibold text-forest-700 dark:bg-forest-800 dark:text-forest-100">{history.length}</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => exportHistory(history, 'xlsx')} disabled={!history.length} className="btn-outline text-sm disabled:opacity-40">
                  <Download className="h-4 w-4" /> Excel
                </button>
                <button type="button" onClick={() => exportHistory(history, 'csv')} disabled={!history.length} className="btn-outline text-sm disabled:opacity-40">
                  <Download className="h-4 w-4" /> CSV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Clear all SMS history?')) setHistory(clearHistory())
                  }}
                  disabled={!history.length}
                  className="rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>

            {history.length === 0 ? (
              <p className="mt-6 text-muted">No messages sent yet.</p>
            ) : (
              <div className="mt-4 max-h-[26rem] overflow-y-auto rounded-xl border border-earth-100 dark:border-forest-800">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-earth-50 text-forest-700 dark:bg-forest-900 dark:text-forest-100">
                    <tr>
                      <th className="p-3 font-semibold">When</th>
                      <th className="p-3 font-semibold">Recipient</th>
                      <th className="p-3 font-semibold">Message</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} className="border-t border-earth-100 dark:border-forest-800">
                        <td className="whitespace-nowrap p-3 text-earth-500 dark:text-forest-400">{new Date(h.timestamp).toLocaleString()}</td>
                        <td className="p-3">
                          <div className="text-forest-900 dark:text-forest-50">{h.name || '—'}</div>
                          <div className="font-mono text-xs text-earth-500 dark:text-forest-400">{formatPhoneDisplay(h.phone)}</div>
                        </td>
                        <td className="max-w-[16rem] p-3 text-forest-700 dark:text-forest-200"><span className="line-clamp-2">{h.message}</span></td>
                        <td className="p-3"><StatusPill status={h.status} /></td>
                        <td className="max-w-[12rem] p-3 text-xs text-earth-500 dark:text-forest-400"><span className="line-clamp-2">{h.response || '—'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Import preview modal */}
      {preview && (
        <Modal onClose={() => setPreview(null)} title="Preview import">
          <p className="text-sm text-muted">
            <strong>{preview.fileName}</strong> — {preview.valid.length} valid, {preview.invalid.length} invalid.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-green-700 dark:text-green-400">Valid ({preview.valid.length})</p>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-earth-100 text-sm dark:border-forest-800">
                {preview.valid.slice(0, 200).map((v, i) => (
                  <div key={i} className="flex justify-between gap-2 border-b border-earth-50 px-3 py-1.5 last:border-0 dark:border-forest-900">
                    <span className="truncate text-forest-800 dark:text-forest-100">{v.name || '—'}</span>
                    <span className="font-mono text-earth-500 dark:text-forest-400">{v.phone}</span>
                  </div>
                ))}
                {preview.valid.length === 0 && <p className="p-3 text-earth-400">None</p>}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-red-700 dark:text-red-400">Rejected ({preview.invalid.length})</p>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-earth-100 text-sm dark:border-forest-800">
                {preview.invalid.slice(0, 200).map((v, i) => (
                  <div key={i} className="flex justify-between gap-2 border-b border-earth-50 px-3 py-1.5 last:border-0 dark:border-forest-900">
                    <span className="truncate font-mono text-earth-600 dark:text-forest-300">{v.raw}</span>
                    <span className="text-red-500">{v.reason}</span>
                  </div>
                ))}
                {preview.invalid.length === 0 && <p className="p-3 text-earth-400">None</p>}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setPreview(null)} className="btn-outline">Cancel</button>
            <button type="button" onClick={confirmImport} disabled={preview.valid.length === 0} className="btn-primary disabled:opacity-50">
              <Check className="h-4 w-4" /> Add {preview.valid.length} contacts
            </button>
          </div>
        </Modal>
      )}

      {/* Send confirmation modal */}
      {confirmOpen && (
        <Modal onClose={() => setConfirmOpen(false)} title="Confirm SMS send">
          <p className="text-forest-800 dark:text-forest-100">
            You are about to send SMS to <strong>{selectedContacts.length}</strong>{' '}
            {selectedContacts.length === 1 ? 'recipient' : 'recipients'}.
          </p>
          <p className="mt-1 text-sm text-muted">Each recipient gets one individual SMS ({segments} {segments === 1 ? 'part' : 'parts'} each).</p>
          <div className="mt-4 rounded-xl bg-earth-50 p-3 text-sm text-forest-700 dark:bg-forest-900 dark:text-forest-200">
            <span className="line-clamp-4 whitespace-pre-wrap">{message}</span>
          </div>
          {pwSaved && !editingPw ? (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-forest-50 px-4 py-3 dark:bg-forest-900/60">
              <span className="flex items-center gap-2 text-sm font-medium text-forest-700 dark:text-forest-200">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" /> Using your saved send password
              </span>
              <button type="button" onClick={forgetPw} className="text-sm font-semibold text-forest-600 underline decoration-gold-400 underline-offset-2 hover:text-forest-800 dark:text-gold-300">
                Change
              </button>
            </div>
          ) : (
            <>
              <label className="mt-4 block text-sm font-semibold text-forest-800 dark:text-forest-100">SMS send password</label>
              <input
                type="password"
                value={sendPw}
                onChange={(e) => setSendPw(e.target.value)}
                placeholder="Set via SMS_SEND_PASSWORD in Vercel"
                className="mt-1 w-full rounded-xl border border-earth-200 bg-white px-4 py-2.5 text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
              />
              <p className="mt-1.5 text-xs text-earth-500 dark:text-forest-400">
                Saved on this device — you'll only enter it once, then sending is one click.
              </p>
            </>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setConfirmOpen(false)} className="btn-outline">Cancel</button>
            <button type="button" onClick={runSend} disabled={!sendPw} className="btn-primary disabled:opacity-50">
              <Send className="h-4 w-4" /> Send now
            </button>
          </div>
        </Modal>
      )}

      {/* Progress modal */}
      {progress && (
        <Modal onClose={progress.running ? undefined : () => setProgress(null)} title={progress.running ? 'Sending…' : 'Send complete'}>
          {progress.running ? (
            <>
              <p className="text-forest-800 dark:text-forest-100">
                Sending {Math.min(progress.done + 1, progress.total)}/{progress.total}…
              </p>
              {progress.current && <p className="mt-1 truncate text-sm text-muted">→ {progress.current}</p>}
            </>
          ) : progress.badPassword ? (
            <p className="font-medium text-red-600 dark:text-red-400">
              The send password was rejected. It has been cleared — you'll be asked for the correct one next time.
            </p>
          ) : (
            <p className="text-forest-800 dark:text-forest-100">Finished sending {progress.total} messages.</p>
          )}

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-earth-100 dark:bg-forest-900">
            <div
              className="h-full rounded-full bg-forest-600 transition-all duration-300"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span className="font-semibold text-green-700 dark:text-green-400">Sent: {progress.sent}</span>
            <span className="font-semibold text-red-600 dark:text-red-400">Failed: {progress.failed}</span>
            <span className="text-muted">Total: {progress.total}</span>
          </div>

          {!progress.running && (
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setProgress(null)} className="btn-primary">
                <Check className="h-4 w-4" /> Done
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-forest-950/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
        disabled={!onClose}
      />
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-forest-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-forest-900 dark:text-forest-50">{title}</h3>
          {onClose && (
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-earth-500 hover:bg-earth-100 dark:text-forest-300 dark:hover:bg-forest-800" aria-label="Close">
              <Close className="h-5 w-5" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
