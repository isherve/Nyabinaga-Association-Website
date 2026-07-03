import { useMemo, useRef, useState } from 'react'
import PageHeader from '../components/PageHeader'
import PasswordModal from '../components/PasswordModal'
import { useAuth } from '../context/AuthContext'
import { featuredImages } from '../content/site'
import { Lock, Coins, Upload, Download, Trash, Check, Close, ArrowRight, Book } from '../components/Icons'
import {
  REPORT_FIELDS,
  NUMERIC_FIELDS,
  MONEY_FIELDS,
  getReports,
  addReport,
  updateReport,
  removeReport,
  clearReports,
  saveReports,
  computeTotals,
} from '../lib/reportsStore'
import { exportReports, parseReportsFile, downloadReportTemplate } from '../lib/reportsIO'
import { igaOutcomes, igaReportMeta } from '../content/igaOutcomes'

// Forward-fill merged outcome/goal/indicator cells for display.
const filledOutcomes = (() => {
  let outcome = ''
  let goal = ''
  let indicator = ''
  return igaOutcomes.map((row) => {
    outcome = row.outcome || outcome
    goal = row.goal || goal
    indicator = row.indicator || indicator
    return { ...row, outcome, goal, indicator }
  })
})()

const reportFileHref = `${import.meta.env.BASE_URL}${igaReportMeta.fileUrl}`

const emptyForm = () => {
  const f = {}
  REPORT_FIELDS.forEach((field) => {
    f[field.key] = field.type === 'number' ? '' : ''
  })
  f.date = new Date().toISOString().slice(0, 10)
  return f
}

const fmtMoney = (n) => `${Number(n || 0).toLocaleString('en-US')}`
const fmtNum = (n) => Number(n || 0).toLocaleString('en-US')

function cellValue(entry, field) {
  const v = entry[field.key]
  if (field.type === 'number') return MONEY_FIELDS.includes(field.key) ? fmtMoney(v) : fmtNum(v)
  return v || ''
}

export default function ReportsAdmin() {
  const { isAdmin } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  const [reports, setReports] = useState(() => getReports())
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [preview, setPreview] = useState(null)
  const [importError, setImportError] = useState('')
  const [fullReportOpen, setFullReportOpen] = useState(false)
  const [viewEntry, setViewEntry] = useState(null)
  const fileRef = useRef(null)

  const persist = (next) => {
    setReports(next)
    saveReports(next)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return reports.filter((r) => {
      if (dateFilter && r.date !== dateFilter) return false
      if (!q) return true
      return [r.pf, r.clusterName, r.fcpCode, r.activities, r.bestAssociation, r.notes]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [reports, search, dateFilter])

  const totals = useMemo(() => computeTotals(filtered), [filtered])

  const openNew = () => {
    setForm(emptyForm())
    setEditingId(null)
    setFormOpen(true)
  }

  const openEdit = (entry) => {
    const f = {}
    REPORT_FIELDS.forEach((field) => {
      f[field.key] = entry[field.key] ?? ''
    })
    setForm(f)
    setEditingId(entry.id)
    setFormOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      persist(updateReport(reports, editingId, form))
    } else {
      const { reports: next } = addReport(reports, form)
      persist(next)
    }
    setFormOpen(false)
    setForm(emptyForm())
    setEditingId(null)
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (fileRef.current) fileRef.current.value = ''
    if (!file) return
    setImportError('')
    try {
      const result = await parseReportsFile(file)
      if (result.total === 0) {
        setImportError('No data rows found in that file.')
        return
      }
      setPreview({ ...result, fileName: file.name })
    } catch (err) {
      setImportError(err?.message || 'Could not read that file.')
    }
  }

  const confirmImport = () => {
    if (!preview) return
    persist([...preview.entries, ...reports])
    setPreview(null)
  }

  if (!isAdmin) {
    return (
      <>
        <PageHeader eyebrow="Admin" title="IGA Reports" subtitle="Track income-generating activities and caregiver associations." image={featuredImages.impact} />
        <section className="section">
          <div className="container-page">
            <div className="card mx-auto max-w-md p-10 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
                <Lock className="h-8 w-8" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold text-forest-900 dark:text-forest-50">Administrators only</h2>
              <p className="mt-2 text-muted">Please sign in as an administrator to access the reports.</p>
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
      <PageHeader eyebrow="Admin" title="IGA Reports" subtitle="Daily income-generating activities & caregiver associations report." image={featuredImages.impact} />

      <section className="section">
        <div className="container-page space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard label="Report entries" value={fmtNum(filtered.length)} />
            <SummaryCard label="Total members" value={fmtNum(totals.totalMembers)} />
            <SummaryCard label="Total associations" value={fmtNum(totals.totalAssociations)} />
            <SummaryCard label="General total value (FRW)" value={fmtMoney(totals.generalTotalValue)} />
          </div>

          {/* Toolbar */}
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search PF, cluster, activity…"
                  className="rounded-xl border border-earth-200 bg-earth-50 px-4 py-2.5 text-sm text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="rounded-xl border border-earth-200 bg-earth-50 px-4 py-2.5 text-sm text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                />
                {(search || dateFilter) && (
                  <button type="button" onClick={() => { setSearch(''); setDateFilter('') }} className="text-sm font-medium text-forest-600 underline decoration-gold-400 underline-offset-2 dark:text-gold-300">
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setFullReportOpen(true)} className="btn-gold text-sm">
                  <Book className="h-4 w-4" /> View full report
                </button>
                <button type="button" onClick={openNew} className="btn-primary text-sm">
                  <ArrowRight className="h-4 w-4" /> New report
                </button>
                <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline text-sm">
                  <Upload className="h-4 w-4" /> Import
                </button>
                <button type="button" onClick={downloadReportTemplate} className="btn-outline text-sm">
                  <Download className="h-4 w-4" /> Template
                </button>
                <button type="button" onClick={() => exportReports(filtered.length ? filtered : reports, 'xlsx')} disabled={!reports.length} className="btn-outline text-sm disabled:opacity-40">
                  <Download className="h-4 w-4" /> Excel
                </button>
                <button type="button" onClick={() => exportReports(filtered.length ? filtered : reports, 'csv')} disabled={!reports.length} className="btn-outline text-sm disabled:opacity-40">
                  <Download className="h-4 w-4" /> CSV
                </button>
                <button
                  type="button"
                  onClick={() => { if (confirm('Delete ALL report entries? This cannot be undone.')) persist(clearReports()) }}
                  disabled={!reports.length}
                  className="rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
            {importError && <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">{importError}</p>}
          </div>

          {/* Table */}
          <div className="card p-0 overflow-hidden">
            {reports.length === 0 ? (
              <div className="py-16 text-center">
                <Coins className="mx-auto h-10 w-10 text-earth-400 dark:text-forest-600" />
                <p className="mt-3 text-muted">No reports yet. Click “New report” or import a spreadsheet.</p>
              </div>
            ) : (
              <div className="max-h-[32rem] overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-earth-50 text-forest-700 dark:bg-forest-900 dark:text-forest-100">
                    <tr>
                      {REPORT_FIELDS.map((f) => (
                        <th key={f.key} className="whitespace-nowrap px-3 py-3 font-semibold">{f.label}</th>
                      ))}
                      <th className="px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} className="border-t border-earth-100 hover:bg-earth-50/60 dark:border-forest-800 dark:hover:bg-forest-900/40">
                        {REPORT_FIELDS.map((f) => (
                          <td
                            key={f.key}
                            className={`px-3 py-2.5 ${f.type === 'number' ? 'text-right font-mono text-forest-700 dark:text-forest-200' : 'text-forest-900 dark:text-forest-50'} ${f.type === 'textarea' ? 'max-w-[16rem]' : 'whitespace-nowrap'}`}
                          >
                            <span className={f.type === 'textarea' ? 'line-clamp-2' : ''}>{cellValue(r, f)}</span>
                          </td>
                        ))}
                        <td className="whitespace-nowrap px-3 py-2.5">
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setViewEntry(r)} className="font-medium text-forest-600 hover:underline dark:text-gold-300">View</button>
                            <button type="button" onClick={() => openEdit(r)} className="font-medium text-forest-600 hover:underline dark:text-gold-300">Edit</button>
                            <button
                              type="button"
                              onClick={() => persist(removeReport(reports, r.id))}
                              className="text-earth-400 transition-colors hover:text-red-600"
                              aria-label="Delete"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="sticky bottom-0 bg-forest-50 font-semibold text-forest-900 dark:bg-forest-800 dark:text-forest-50">
                    <tr>
                      {REPORT_FIELDS.map((f, i) => (
                        <td key={f.key} className={`px-3 py-3 ${f.type === 'number' ? 'text-right font-mono' : ''} whitespace-nowrap`}>
                          {i === 0 ? 'TOTALS' : NUMERIC_FIELDS.includes(f.key) ? (MONEY_FIELDS.includes(f.key) ? fmtMoney(totals[f.key]) : fmtNum(totals[f.key])) : ''}
                        </td>
                      ))}
                      <td className="px-3 py-3" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Entry form modal */}
      {formOpen && (
        <Modal onClose={() => setFormOpen(false)} title={editingId ? 'Edit report' : 'New IGA report'}>
          <form onSubmit={handleSubmit}>
            <div className="grid max-h-[60vh] gap-4 overflow-y-auto p-1 sm:grid-cols-2">
              {REPORT_FIELDS.map((f) => (
                <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label htmlFor={f.key} className="block text-sm font-semibold text-forest-800 dark:text-forest-100">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      id={f.key}
                      rows={3}
                      value={form[f.key]}
                      onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                      className="mt-1 w-full resize-y rounded-xl border border-earth-200 bg-earth-50 px-3 py-2 text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                    />
                  ) : (
                    <input
                      id={f.key}
                      type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                      value={form[f.key]}
                      onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-earth-200 bg-earth-50 px-3 py-2 text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setFormOpen(false)} className="btn-outline">Cancel</button>
              <button type="submit" className="btn-primary">
                <Check className="h-4 w-4" /> {editingId ? 'Save changes' : 'Add report'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Import preview modal */}
      {preview && (
        <Modal onClose={() => setPreview(null)} title="Preview import">
          <p className="text-sm text-muted">
            <strong>{preview.fileName}</strong> — {preview.entries.length} rows to import
            {preview.skipped ? `, ${preview.skipped} skipped (empty/totals)` : ''}.
          </p>
          <div className="mt-4 max-h-64 overflow-auto rounded-lg border border-earth-100 dark:border-forest-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-earth-50 dark:bg-forest-900">
                <tr>
                  <th className="px-2 py-1.5">Date</th>
                  <th className="px-2 py-1.5">PF</th>
                  <th className="px-2 py-1.5">Cluster</th>
                  <th className="px-2 py-1.5 text-right">Members</th>
                  <th className="px-2 py-1.5 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {preview.entries.slice(0, 100).map((e) => (
                  <tr key={e.id} className="border-t border-earth-50 dark:border-forest-900">
                    <td className="px-2 py-1.5">{e.date}</td>
                    <td className="px-2 py-1.5">{e.pf}</td>
                    <td className="px-2 py-1.5">{e.clusterName}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{fmtNum(e.totalMembers)}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{fmtMoney(e.generalTotalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setPreview(null)} className="btn-outline">Cancel</button>
            <button type="button" onClick={confirmImport} disabled={!preview.entries.length} className="btn-primary disabled:opacity-50">
              <Check className="h-4 w-4" /> Import {preview.entries.length} rows
            </button>
          </div>
        </Modal>
      )}

      {/* Single entry detail view */}
      {viewEntry && (
        <Modal onClose={() => setViewEntry(null)} title={`Report — ${viewEntry.clusterName || viewEntry.pf || 'Details'}`}>
          <dl className="grid max-h-[65vh] gap-x-6 gap-y-3 overflow-y-auto p-1 sm:grid-cols-2">
            {REPORT_FIELDS.map((f) => (
              <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-earth-500 dark:text-forest-400">{f.label}</dt>
                <dd className={`mt-0.5 text-forest-900 dark:text-forest-50 ${f.type === 'number' ? 'font-mono' : ''}`}>
                  {cellValue(viewEntry, f) || <span className="text-earth-400">—</span>}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => { const e = viewEntry; setViewEntry(null); openEdit(e) }} className="btn-outline">Edit</button>
            <button type="button" onClick={() => setViewEntry(null)} className="btn-primary">Close</button>
          </div>
        </Modal>
      )}

      {/* Full report view (both sheets) */}
      {fullReportOpen && (
        <Modal onClose={() => setFullReportOpen(false)} title={igaReportMeta.title}>
          <div className="max-h-[70vh] space-y-6 overflow-y-auto p-1">
            <div className="rounded-2xl bg-forest-50 p-4 dark:bg-forest-900/60">
              <div className="grid gap-2 sm:grid-cols-2">
                <Meta label="Cycle" value={igaReportMeta.cycle} />
                <Meta label="Quarter" value={igaReportMeta.quarter} />
                <Meta label="PF / Manager" value={igaReportMeta.pf} />
                <Meta label="Cluster" value={igaReportMeta.cluster} />
              </div>
              <a href={reportFileHref} download className="btn-outline mt-4 text-sm">
                <Download className="h-4 w-4" /> Download original Excel
              </a>
            </div>

            {/* Part 1: IGA financial entries */}
            <div>
              <h4 className="mb-2 font-display text-lg font-bold text-forest-900 dark:text-forest-50">Part 1 — IGA financial summary</h4>
              {reports.length === 0 ? (
                <p className="text-sm text-muted">No entries yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-earth-100 dark:border-forest-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-earth-50 text-forest-700 dark:bg-forest-900 dark:text-forest-100">
                      <tr>
                        <th className="px-2 py-1.5">PF</th>
                        <th className="px-2 py-1.5">Cluster</th>
                        <th className="px-2 py-1.5 text-right">Assoc.</th>
                        <th className="px-2 py-1.5 text-right">Members</th>
                        <th className="px-2 py-1.5 text-right">Loans</th>
                        <th className="px-2 py-1.5 text-right">Cash</th>
                        <th className="px-2 py-1.5 text-right">General Total</th>
                        <th className="px-2 py-1.5">Best assoc.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((r) => (
                        <tr key={r.id} className="border-t border-earth-50 dark:border-forest-900">
                          <td className="px-2 py-1.5">{r.pf}</td>
                          <td className="px-2 py-1.5">{r.clusterName}</td>
                          <td className="px-2 py-1.5 text-right font-mono">{fmtNum(r.totalAssociations)}</td>
                          <td className="px-2 py-1.5 text-right font-mono">{fmtNum(r.totalMembers)}</td>
                          <td className="px-2 py-1.5 text-right font-mono">{fmtMoney(r.totalLoans)}</td>
                          <td className="px-2 py-1.5 text-right font-mono">{fmtMoney(r.totalCash)}</td>
                          <td className="px-2 py-1.5 text-right font-mono">{fmtMoney(r.generalTotalValue)}</td>
                          <td className="px-2 py-1.5">{r.bestAssociation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Part 2: Outcomes & indicators */}
            <div>
              <h4 className="mb-2 font-display text-lg font-bold text-forest-900 dark:text-forest-50">Part 2 — Outcomes &amp; indicators</h4>
              <div className="space-y-4">
                {groupByOutcome(filledOutcomes).map((group) => (
                  <div key={group.outcome} className="overflow-hidden rounded-xl border border-earth-100 dark:border-forest-800">
                    <div className="bg-forest-600 px-3 py-2 text-sm font-bold text-white dark:bg-forest-700">{group.outcome}</div>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-earth-50 text-forest-700 dark:bg-forest-900 dark:text-forest-100">
                        <tr>
                          <th className="w-10 px-2 py-1.5">No</th>
                          <th className="px-2 py-1.5">Indicator</th>
                          <th className="px-2 py-1.5">Activity target</th>
                          <th className="w-14 px-2 py-1.5 text-right">Number</th>
                          <th className="px-2 py-1.5">Narrative</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.rows.map((row) => (
                          <tr key={row.no} className="border-t border-earth-50 align-top dark:border-forest-900">
                            <td className="px-2 py-1.5 font-mono font-semibold">{row.no}</td>
                            <td className="px-2 py-1.5 text-forest-800 dark:text-forest-100">{row.indicator}</td>
                            <td className="px-2 py-1.5 text-earth-600 dark:text-forest-300">{row.target}</td>
                            <td className="px-2 py-1.5 text-right font-mono">{row.numbers || '—'}</td>
                            <td className="px-2 py-1.5 text-forest-700 dark:text-forest-200">{row.narrative || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => setFullReportOpen(false)} className="btn-primary">Close</button>
          </div>
        </Modal>
      )}
    </>
  )
}

// Group forward-filled outcome rows by their outcome heading.
function groupByOutcome(rows) {
  const groups = []
  for (const row of rows) {
    let g = groups.find((x) => x.outcome === row.outcome)
    if (!g) {
      g = { outcome: row.outcome, rows: [] }
      groups.push(g)
    }
    g.rows.push(row)
  }
  return groups
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-earth-500 dark:text-forest-400">{label}</p>
      <p className="text-forest-900 dark:text-forest-50">{value}</p>
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-earth-500 dark:text-forest-400">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-forest-900 dark:text-forest-50">{value}</p>
    </div>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-forest-950/60 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-forest-900">
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
