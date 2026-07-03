// Local persistence for IGA (Income-Generating Activities) daily reports.
//
// Modeled on the "FY26 Q4 IGA Reports" spreadsheet: each entry captures one
// cluster/association line with membership + financial figures. Stored in the
// admin's browser (localStorage) — same approach as the SMS Center, so it works
// with no extra database. Swap these functions for API/DB calls later if needed.

const REPORTS_KEY = 'nyabinaga_iga_reports_v1'

// Field definitions drive the form, table, totals and Excel columns so the
// whole feature stays in sync from one place.
export const REPORT_FIELDS = [
  { key: 'date', label: 'Date', type: 'date', excel: 'Date' },
  { key: 'pf', label: 'PF / Manager', type: 'text', excel: 'PFs per Manager' },
  { key: 'clusterName', label: 'Cluster Name', type: 'text', excel: 'Cluster Name' },
  { key: 'fcpCode', label: 'FCP Code', type: 'text', excel: '# of FCPs (code)' },
  { key: 'numFcps', label: '# of FCPs', type: 'number', excel: '# of FCPs' },
  { key: 'baselineAssociations', label: 'Baseline Associations', type: 'number', excel: 'Baseline of Existing Associations' },
  { key: 'baselineMembers', label: 'Baseline Members', type: 'number', excel: 'Baseline of Existing Members' },
  { key: 'newAssociations', label: 'New Associations', type: 'number', excel: 'Total # of new associations' },
  { key: 'newMembers', label: 'New Members', type: 'number', excel: 'Total # of members joined' },
  { key: 'totalAssociations', label: 'Total Associations', type: 'number', excel: 'Total # Associations (E+G)' },
  { key: 'totalMembers', label: 'Total Members', type: 'number', excel: 'Total # Members (F+H)' },
  { key: 'activities', label: 'Activity list (Key IGAs)', type: 'textarea', excel: 'Activity lists (Key IGAs)' },
  { key: 'baselineValue', label: 'Baseline Total Value (FRW)', type: 'number', excel: 'Baseline of Total Value (FRW)' },
  { key: 'fixedAssets', label: 'Fixed Assets (FRW)', type: 'number', excel: 'Value of Fixed Assets (FRW)' },
  { key: 'totalLoans', label: 'Total Loans (FRW)', type: 'number', excel: 'Total loans (FRW)' },
  { key: 'totalCash', label: 'Total Cash (FRW)', type: 'number', excel: 'Total cash (FRW)' },
  { key: 'totalValue', label: 'Total Value (FRW)', type: 'number', excel: 'Total value (FRW)' },
  { key: 'generalTotalValue', label: 'General Total Value (FRW)', type: 'number', excel: 'General Total Value (FRW)' },
  { key: 'bestAssociation', label: 'Best Performing Association', type: 'text', excel: 'One best performing association' },
  { key: 'notes', label: 'Notes / Narrative', type: 'textarea', excel: 'Notes' },
]

// Columns that should be summed in the totals row.
export const NUMERIC_FIELDS = REPORT_FIELDS.filter((f) => f.type === 'number').map((f) => f.key)

// Money columns (formatted with thousands separators and "FRW").
export const MONEY_FIELDS = [
  'baselineValue',
  'fixedAssets',
  'totalLoans',
  'totalCash',
  'totalValue',
  'generalTotalValue',
]

function read() {
  try {
    const raw = localStorage.getItem(REPORTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function write(value) {
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(value))
  } catch {
    /* storage unavailable — ignore */
  }
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

export function getReports() {
  return read()
}

export function saveReports(reports) {
  write(reports)
  return reports
}

/** Coerce a value to the field's type (numbers become finite numbers or 0). */
export function coerceField(field, value) {
  if (field.type === 'number') {
    const n = Number(String(value).replace(/[, ]/g, ''))
    return Number.isFinite(n) ? n : 0
  }
  return value == null ? '' : String(value).trim()
}

/** Build a normalized entry object from raw form/import values. */
export function normalizeEntry(raw) {
  const entry = { id: raw.id || uid(), createdAt: raw.createdAt || new Date().toISOString() }
  for (const f of REPORT_FIELDS) {
    entry[f.key] = coerceField(f, raw[f.key])
  }
  if (!entry.date) entry.date = new Date().toISOString().slice(0, 10)
  return entry
}

export function addReport(existing, raw) {
  const entry = normalizeEntry(raw)
  const next = [entry, ...existing]
  write(next)
  return { reports: next, entry }
}

export function updateReport(existing, id, raw) {
  const next = existing.map((r) => (r.id === id ? normalizeEntry({ ...r, ...raw, id }) : r))
  write(next)
  return next
}

export function removeReport(existing, id) {
  const next = existing.filter((r) => r.id !== id)
  write(next)
  return next
}

export function clearReports() {
  write([])
  return []
}

/** Sum numeric fields across the provided entries → totals object. */
export function computeTotals(reports) {
  const totals = {}
  for (const key of NUMERIC_FIELDS) {
    totals[key] = reports.reduce((sum, r) => sum + (Number(r[key]) || 0), 0)
  }
  return totals
}
