import { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import PageHeader from '../components/PageHeader'
import PasswordModal from '../components/PasswordModal'
import { useAuth } from '../context/AuthContext'
import { featuredImages } from '../content/site'
import { Lock, Calendar, Clock, Users, Download, Trash, Check, Close, ArrowRight, MapPin } from '../components/Icons'
import {
  STAFF_ROLES,
  MEETING_STATUSES,
  getMeetings,
  addMeeting,
  updateMeeting,
  removeMeeting,
  clearMeetings,
  statusLabel,
} from '../lib/meetingsStore'

const emptyForm = () => ({
  title: '',
  date: new Date().toISOString().slice(0, 10),
  time: '09:00',
  duration: 60,
  location: '',
  organizer: STAFF_ROLES[0],
  attendees: STAFF_ROLES.slice(),
  agenda: '',
  minutes: '',
  status: 'scheduled',
})

const fmtDate = (d) => {
  try {
    return new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return d
  }
}

const fmtTime = (t) => {
  try {
    const [h, m] = t.split(':')
    return new Date(0, 0, 0, Number(h), Number(m)).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  } catch {
    return t
  }
}

const statusStyle = {
  scheduled: 'bg-forest-100 text-forest-700 dark:bg-forest-800 dark:text-gold-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
}

const isPast = (m) => `${m.date}T${m.time || '00:00'}` < new Date().toISOString().slice(0, 16)

export default function MeetingsAdmin() {
  const { isAdmin } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  const [meetings, setMeetings] = useState(() => getMeetings())
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return meetings.filter((m) => {
      if (statusFilter && m.status !== statusFilter) return false
      if (!q) return true
      return [m.title, m.location, m.organizer, m.agenda, m.minutes, ...(m.attendees || [])]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [meetings, search, statusFilter])

  const stats = useMemo(() => ({
    total: meetings.length,
    upcoming: meetings.filter((m) => m.status === 'scheduled' && !isPast(m)).length,
    completed: meetings.filter((m) => m.status === 'completed').length,
  }), [meetings])

  const openNew = () => {
    setForm(emptyForm())
    setEditingId(null)
    setFormOpen(true)
  }

  const openEdit = (m) => {
    setForm({
      title: m.title,
      date: m.date,
      time: m.time,
      duration: m.duration,
      location: m.location,
      organizer: m.organizer,
      attendees: m.attendees?.slice() || STAFF_ROLES.slice(),
      agenda: m.agenda,
      minutes: m.minutes,
      status: m.status,
    })
    setEditingId(m.id)
    setFormOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      setMeetings(updateMeeting(meetings, editingId, form))
    } else {
      const { meetings: next } = addMeeting(meetings, form)
      setMeetings(next)
    }
    setFormOpen(false)
    setForm(emptyForm())
    setEditingId(null)
  }

  const toggleAttendee = (role) =>
    setForm((s) => ({
      ...s,
      attendees: s.attendees.includes(role) ? s.attendees.filter((a) => a !== role) : [...s.attendees, role],
    }))

  const changeStatus = (m, status) => setMeetings(updateMeeting(meetings, m.id, { ...m, status }))

  const exportExcel = () => {
    const rows = (filtered.length ? filtered : meetings).map((m) => ({
      Title: m.title,
      Date: m.date,
      Time: m.time,
      'Duration (min)': m.duration,
      Location: m.location,
      Organizer: m.organizer,
      Attendees: (m.attendees || []).join(', '),
      Status: statusLabel(m.status),
      Agenda: m.agenda,
      Minutes: m.minutes,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Meetings')
    XLSX.writeFile(wb, `nyabinaga-meetings-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  if (!isAdmin) {
    return (
      <>
        <PageHeader eyebrow="Staff" title="Meeting Management" subtitle="Schedule and organize meetings between the Director, PCD, Accountant and Doctor." image={featuredImages.impact} />
        <section className="section">
          <div className="container-page">
            <div className="card mx-auto max-w-md p-10 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
                <Lock className="h-8 w-8" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold text-forest-900 dark:text-forest-50">Staff only</h2>
              <p className="mt-2 text-muted">Please sign in to schedule and manage meetings.</p>
              <button type="button" onClick={() => setLoginOpen(true)} className="btn-primary mx-auto mt-6">
                <Lock className="h-4 w-4" /> Sign in
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
      <PageHeader eyebrow="Staff" title="Meeting Management" subtitle="Schedule and organize meetings between the Director, PCD, Accountant and Doctor." image={featuredImages.impact} />

      <section className="section">
        <div className="container-page space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard label="All meetings" value={stats.total} />
            <SummaryCard label="Upcoming" value={stats.upcoming} />
            <SummaryCard label="Completed" value={stats.completed} />
          </div>

          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, agenda, attendee…"
                  className={filterCls}
                />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={filterCls}>
                  <option value="">All statuses</option>
                  {MEETING_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                {(search || statusFilter) && (
                  <button type="button" onClick={() => { setSearch(''); setStatusFilter('') }} className="text-sm font-medium text-forest-600 underline decoration-gold-400 underline-offset-2 dark:text-gold-300">
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={openNew} className="btn-primary text-sm">
                  <ArrowRight className="h-4 w-4" /> Schedule meeting
                </button>
                <button type="button" onClick={exportExcel} disabled={!meetings.length} className="btn-outline text-sm disabled:opacity-40">
                  <Download className="h-4 w-4" /> Excel
                </button>
                <button
                  type="button"
                  onClick={() => { if (confirm('Delete ALL meetings? This cannot be undone.')) setMeetings(clearMeetings()) }}
                  disabled={!meetings.length}
                  className="rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="card py-16 text-center">
              <Calendar className="mx-auto h-10 w-10 text-earth-400 dark:text-forest-600" />
              <p className="mt-3 text-muted">No meetings yet. Click “Schedule meeting” to plan one.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((m) => (
                <article key={m.id} className={`card flex flex-col p-5 ${m.status === 'cancelled' ? 'opacity-70' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg font-bold text-forest-900 dark:text-forest-50">{m.title || 'Untitled meeting'}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                        <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {fmtDate(m.date)}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {fmtTime(m.time)} · {m.duration}m</span>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[m.status] || ''}`}>{statusLabel(m.status)}</span>
                  </div>

                  {m.location && (
                    <p className="mt-2 inline-flex items-center gap-1 text-sm text-forest-800 dark:text-forest-100"><MapPin className="h-4 w-4 text-forest-500" /> {m.location}</p>
                  )}

                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-earth-500 dark:text-forest-400">Attendees</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {STAFF_ROLES.map((role) => {
                        const going = m.attendees?.includes(role)
                        return (
                          <span
                            key={role}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                              going
                                ? 'bg-forest-100 text-forest-700 dark:bg-forest-800 dark:text-forest-100'
                                : 'bg-earth-100 text-earth-400 line-through dark:bg-forest-900 dark:text-forest-500'
                            }`}
                          >
                            {role === m.organizer && <span title="Organizer" className="text-gold-500">★</span>}
                            {role}
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  {m.agenda && (
                    <div className="mt-3 text-sm">
                      <span className="font-semibold text-forest-700 dark:text-forest-200">Agenda: </span>
                      <span className="text-muted">{m.agenda}</span>
                    </div>
                  )}
                  {m.minutes && (
                    <div className="mt-2 text-sm">
                      <span className="font-semibold text-forest-700 dark:text-forest-200">Minutes: </span>
                      <span className="text-muted">{m.minutes}</span>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-earth-100 pt-3 dark:border-forest-800">
                    {m.status !== 'completed' && (
                      <button type="button" onClick={() => changeStatus(m, 'completed')} className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300">
                        Mark completed
                      </button>
                    )}
                    {m.status !== 'cancelled' && (
                      <button type="button" onClick={() => changeStatus(m, 'cancelled')} className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300">
                        Cancel
                      </button>
                    )}
                    {m.status !== 'scheduled' && (
                      <button type="button" onClick={() => changeStatus(m, 'scheduled')} className="rounded-full bg-forest-100 px-3 py-1.5 text-xs font-semibold text-forest-700 transition-colors hover:bg-forest-200 dark:bg-forest-800 dark:text-gold-300">
                        Reschedule
                      </button>
                    )}
                    <span className="flex-1" />
                    <button type="button" onClick={() => openEdit(m)} className="text-sm font-medium text-forest-600 hover:underline dark:text-gold-300">Edit</button>
                    <button type="button" onClick={() => setMeetings(removeMeeting(meetings, m.id))} className="text-earth-400 transition-colors hover:text-red-600" aria-label="Delete">
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {formOpen && (
        <Modal onClose={() => setFormOpen(false)} title={editingId ? 'Edit meeting' : 'Schedule meeting'}>
          <form onSubmit={handleSubmit}>
            <div className="grid max-h-[62vh] gap-4 overflow-y-auto p-1 sm:grid-cols-2">
              <Field label="Meeting title" full>
                <input type="text" required value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} placeholder="e.g. Monthly staff coordination" className={inputCls} />
              </Field>
              <Field label="Date">
                <input type="date" required value={form.date} onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Time">
                <input type="time" required value={form.time} onChange={(e) => setForm((s) => ({ ...s, time: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Duration (minutes)">
                <input type="number" min="0" step="15" value={form.duration} onChange={(e) => setForm((s) => ({ ...s, duration: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Location / link">
                <input type="text" value={form.location} onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))} placeholder="Office, or a video call link" className={inputCls} />
              </Field>

              <Field label="Organizer" full>
                <select value={form.organizer} onChange={(e) => setForm((s) => ({ ...s, organizer: e.target.value, attendees: s.attendees.includes(e.target.value) ? s.attendees : [...s.attendees, e.target.value] }))} className={inputCls}>
                  {STAFF_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Field>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-forest-800 dark:text-forest-100">Attendees</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {STAFF_ROLES.map((role) => (
                    <label key={role} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                      form.attendees.includes(role)
                        ? 'border-forest-400 bg-forest-50 text-forest-800 dark:border-forest-500 dark:bg-forest-800 dark:text-forest-50'
                        : 'border-earth-200 text-forest-700 dark:border-forest-700 dark:text-forest-200'
                    }`}>
                      <input type="checkbox" checked={form.attendees.includes(role)} onChange={() => toggleAttendee(role)} className="h-4 w-4 accent-forest-600" />
                      {role}
                    </label>
                  ))}
                </div>
              </div>

              <Field label="Agenda" full>
                <textarea rows={2} value={form.agenda} onChange={(e) => setForm((s) => ({ ...s, agenda: e.target.value }))} placeholder="Topics to cover" className={inputCls} />
              </Field>
              <Field label="Minutes / notes" full>
                <textarea rows={2} value={form.minutes} onChange={(e) => setForm((s) => ({ ...s, minutes: e.target.value }))} placeholder="Decisions and notes (after the meeting)" className={inputCls} />
              </Field>
              <Field label="Status" full>
                <select value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))} className={inputCls}>
                  {MEETING_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setFormOpen(false)} className="btn-outline">Cancel</button>
              <button type="submit" className="btn-primary">
                <Check className="h-4 w-4" /> {editingId ? 'Save changes' : 'Schedule'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

const inputCls =
  'mt-1 w-full rounded-xl border border-earth-200 bg-earth-50 px-3 py-2 text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50'
const filterCls =
  'rounded-xl border border-earth-200 bg-earth-50 px-4 py-2.5 text-sm text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50'

function Field({ label, full, children }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-semibold text-forest-800 dark:text-forest-100">{label}</label>
      {children}
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-earth-500 dark:text-forest-400">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-forest-900 dark:text-forest-50">{Number(value).toLocaleString('en-US')}</p>
    </div>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-forest-950/60 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-forest-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-forest-900 dark:text-forest-50">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-earth-500 hover:bg-earth-100 dark:text-forest-300 dark:hover:bg-forest-800" aria-label="Close">
            <Close className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
