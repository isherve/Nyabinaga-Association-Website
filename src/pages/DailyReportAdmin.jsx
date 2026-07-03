import { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import PageHeader from '../components/PageHeader'
import PasswordModal from '../components/PasswordModal'
import { useAuth } from '../context/AuthContext'
import { featuredImages } from '../content/site'
import { Lock, ClipboardList, Download, Trash, Check, Close, ArrowRight } from '../components/Icons'
import {
  STAFF_ROLES,
  TASK_STATUSES,
  getDailyReports,
  addDaily,
  updateDaily,
  removeDaily,
  clearDaily,
  taskLabel,
} from '../lib/dailyReportStore'

const emptyForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  staffName: '',
  role: STAFF_ROLES[0],
  summary: '',
  tasks: [{ title: '', status: 'done' }],
  hours: '',
  challenges: '',
  tomorrow: '',
})

const fmtDate = (d) => {
  try {
    return new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return d
  }
}

const statusStyle = {
  done: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'in-progress': 'bg-gold-100 text-earth-700 dark:bg-gold-900/30 dark:text-gold-300',
  pending: 'bg-earth-100 text-earth-600 dark:bg-forest-800 dark:text-forest-300',
}

export default function DailyReportAdmin() {
  const { isAdmin } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  const [reports, setReports] = useState(() => getDailyReports())
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return reports.filter((r) => {
      if (dateFilter && r.date !== dateFilter) return false
      if (roleFilter && r.role !== roleFilter) return false
      if (!q) return true
      return [r.staffName, r.role, r.summary, r.challenges, r.tomorrow, ...(r.tasks || []).map((t) => t.title)]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [reports, search, dateFilter, roleFilter])

  const stats = useMemo(() => {
    const tasks = filtered.reduce((sum, r) => sum + (r.tasks?.length || 0), 0)
    const done = filtered.reduce((sum, r) => sum + (r.tasks?.filter((t) => t.status === 'done').length || 0), 0)
    const hours = filtered.reduce((sum, r) => sum + (Number(r.hours) || 0), 0)
    return { tasks, done, hours }
  }, [filtered])

  const openNew = () => {
    setForm(emptyForm())
    setEditingId(null)
    setFormOpen(true)
  }

  const openEdit = (entry) => {
    setForm({
      date: entry.date,
      staffName: entry.staffName,
      role: entry.role,
      summary: entry.summary,
      tasks: entry.tasks?.length ? entry.tasks.map((t) => ({ ...t })) : [{ title: '', status: 'done' }],
      hours: entry.hours ?? '',
      challenges: entry.challenges,
      tomorrow: entry.tomorrow,
    })
    setEditingId(entry.id)
    setFormOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      setReports(updateDaily(reports, editingId, form))
    } else {
      const { reports: next } = addDaily(reports, form)
      setReports(next)
    }
    setFormOpen(false)
    setForm(emptyForm())
    setEditingId(null)
  }

  const updateTask = (i, patch) =>
    setForm((s) => ({ ...s, tasks: s.tasks.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) }))
  const addTask = () => setForm((s) => ({ ...s, tasks: [...s.tasks, { title: '', status: 'done' }] }))
  const removeTask = (i) => setForm((s) => ({ ...s, tasks: s.tasks.filter((_, idx) => idx !== i) }))

  const exportExcel = () => {
    const rows = (filtered.length ? filtered : reports).map((r) => ({
      Date: r.date,
      Staff: r.staffName,
      Role: r.role,
      Summary: r.summary,
      Tasks: (r.tasks || []).map((t) => `${t.title} (${taskLabel(t.status)})`).join('; '),
      Hours: r.hours,
      Challenges: r.challenges,
      'Plan for tomorrow': r.tomorrow,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Daily Reports')
    XLSX.writeFile(wb, `nyabinaga-daily-reports-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  if (!isAdmin) {
    return (
      <>
        <PageHeader eyebrow="Staff" title="Daily Work Report" subtitle="Log the work completed each day and submit a daily activity report." image={featuredImages.impact} />
        <section className="section">
          <div className="container-page">
            <div className="card mx-auto max-w-md p-10 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
                <Lock className="h-8 w-8" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold text-forest-900 dark:text-forest-50">Staff only</h2>
              <p className="mt-2 text-muted">Please sign in to log and view daily work reports.</p>
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
      <PageHeader eyebrow="Staff" title="Daily Work Report" subtitle="Log the work completed each day and submit a daily activity report." image={featuredImages.impact} />

      <section className="section">
        <div className="container-page space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard label="Reports" value={filtered.length} />
            <SummaryCard label="Tasks logged" value={stats.tasks} />
            <SummaryCard label="Tasks completed" value={stats.done} />
            <SummaryCard label="Hours worked" value={stats.hours} />
          </div>

          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search staff, task, note…"
                  className="rounded-xl border border-earth-200 bg-earth-50 px-4 py-2.5 text-sm text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-xl border border-earth-200 bg-earth-50 px-4 py-2.5 text-sm text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                >
                  <option value="">All roles</option>
                  {STAFF_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="rounded-xl border border-earth-200 bg-earth-50 px-4 py-2.5 text-sm text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                />
                {(search || dateFilter || roleFilter) && (
                  <button type="button" onClick={() => { setSearch(''); setDateFilter(''); setRoleFilter('') }} className="text-sm font-medium text-forest-600 underline decoration-gold-400 underline-offset-2 dark:text-gold-300">
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={openNew} className="btn-primary text-sm">
                  <ArrowRight className="h-4 w-4" /> New daily report
                </button>
                <button type="button" onClick={exportExcel} disabled={!reports.length} className="btn-outline text-sm disabled:opacity-40">
                  <Download className="h-4 w-4" /> Excel
                </button>
                <button
                  type="button"
                  onClick={() => { if (confirm('Delete ALL daily reports? This cannot be undone.')) setReports(clearDaily()) }}
                  disabled={!reports.length}
                  className="rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="card py-16 text-center">
              <ClipboardList className="mx-auto h-10 w-10 text-earth-400 dark:text-forest-600" />
              <p className="mt-3 text-muted">No daily reports yet. Click “New daily report” to log today’s work.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((r) => (
                <article key={r.id} className="card flex flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-bold text-forest-900 dark:text-forest-50">{r.staffName || '—'}</p>
                      <p className="text-sm text-muted">{r.role} · {fmtDate(r.date)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {r.hours !== '' && (
                        <span className="rounded-full bg-forest-100 px-2.5 py-1 text-xs font-semibold text-forest-700 dark:bg-forest-800 dark:text-gold-300">{r.hours}h</span>
                      )}
                      <button type="button" onClick={() => openEdit(r)} className="text-sm font-medium text-forest-600 hover:underline dark:text-gold-300">Edit</button>
                      <button type="button" onClick={() => setReports(removeDaily(reports, r.id))} className="text-earth-400 transition-colors hover:text-red-600" aria-label="Delete">
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {r.summary && <p className="mt-3 text-sm text-forest-800 dark:text-forest-100">{r.summary}</p>}

                  {r.tasks?.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {r.tasks.map((t, i) => (
                        <li key={i} className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-forest-800 dark:text-forest-100">{t.title}</span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyle[t.status] || ''}`}>{taskLabel(t.status)}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {(r.challenges || r.tomorrow) && (
                    <div className="mt-3 space-y-2 border-t border-earth-100 pt-3 text-sm dark:border-forest-800">
                      {r.challenges && (
                        <p><span className="font-semibold text-forest-700 dark:text-forest-200">Challenges: </span><span className="text-muted">{r.challenges}</span></p>
                      )}
                      {r.tomorrow && (
                        <p><span className="font-semibold text-forest-700 dark:text-forest-200">Tomorrow: </span><span className="text-muted">{r.tomorrow}</span></p>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {formOpen && (
        <Modal onClose={() => setFormOpen(false)} title={editingId ? 'Edit daily report' : 'New daily report'}>
          <form onSubmit={handleSubmit}>
            <div className="grid max-h-[62vh] gap-4 overflow-y-auto p-1 sm:grid-cols-2">
              <Field label="Date">
                <input type="date" required value={form.date} onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Staff name">
                <input type="text" required value={form.staffName} onChange={(e) => setForm((s) => ({ ...s, staffName: e.target.value }))} placeholder="Full name" className={inputCls} />
              </Field>
              <Field label="Role">
                <select value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))} className={inputCls}>
                  {STAFF_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Hours worked">
                <input type="number" min="0" step="0.5" value={form.hours} onChange={(e) => setForm((s) => ({ ...s, hours: e.target.value }))} placeholder="8" className={inputCls} />
              </Field>

              <Field label="Summary of the day" full>
                <textarea rows={2} value={form.summary} onChange={(e) => setForm((s) => ({ ...s, summary: e.target.value }))} placeholder="Brief overview of what was accomplished" className={inputCls} />
              </Field>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-forest-800 dark:text-forest-100">Tasks completed</label>
                  <button type="button" onClick={addTask} className="text-sm font-medium text-forest-600 hover:underline dark:text-gold-300">+ Add task</button>
                </div>
                <div className="mt-2 space-y-2">
                  {form.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => updateTask(i, { title: e.target.value })}
                        placeholder={`Task ${i + 1}`}
                        className={`${inputCls} flex-1`}
                      />
                      <select value={task.status} onChange={(e) => updateTask(i, { status: e.target.value })} className={`${inputCls} w-36`}>
                        {TASK_STATUSES.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                      {form.tasks.length > 1 && (
                        <button type="button" onClick={() => removeTask(i)} className="text-earth-400 transition-colors hover:text-red-600" aria-label="Remove task">
                          <Close className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Field label="Challenges / blockers" full>
                <textarea rows={2} value={form.challenges} onChange={(e) => setForm((s) => ({ ...s, challenges: e.target.value }))} placeholder="Anything that slowed the work down" className={inputCls} />
              </Field>
              <Field label="Plan for tomorrow" full>
                <textarea rows={2} value={form.tomorrow} onChange={(e) => setForm((s) => ({ ...s, tomorrow: e.target.value }))} placeholder="What comes next" className={inputCls} />
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setFormOpen(false)} className="btn-outline">Cancel</button>
              <button type="submit" className="btn-primary">
                <Check className="h-4 w-4" /> {editingId ? 'Save changes' : 'Submit report'}
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
