// Import/export IGA daily reports as Excel (.xlsx) and CSV using SheetJS.

import * as XLSX from 'xlsx'
import { REPORT_FIELDS, NUMERIC_FIELDS, normalizeEntry, computeTotals } from './reportsStore'

const norm = (s) => String(s || '').trim().toLowerCase().replace(/[_\s]+/g, ' ')

// Map an imported header cell back to a field key (matches Excel label or key).
function headerToKey(header) {
  const h = norm(header)
  for (const f of REPORT_FIELDS) {
    if (norm(f.excel) === h || norm(f.label) === h || norm(f.key) === h) return f.key
  }
  return null
}

function timestampName(base, ext) {
  const d = new Date()
  const pad = (x) => String(x).padStart(2, '0')
  return `${base}-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.${ext}`
}

function toRow(entry) {
  const row = {}
  for (const f of REPORT_FIELDS) row[f.excel] = entry[f.key] ?? ''
  return row
}

/** Export reports (plus a totals row) to .xlsx or .csv. */
export function exportReports(reports, format = 'xlsx') {
  const headers = REPORT_FIELDS.map((f) => f.excel)
  const rows = reports.map(toRow)

  // Append a totals row for numeric columns.
  const totals = computeTotals(reports)
  const totalRow = {}
  REPORT_FIELDS.forEach((f, i) => {
    if (i === 0) totalRow[f.excel] = 'TOTALS'
    else if (NUMERIC_FIELDS.includes(f.key)) totalRow[f.excel] = totals[f.key]
    else totalRow[f.excel] = ''
  })
  rows.push(totalRow)

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'IGA Reports')
  XLSX.writeFile(wb, timestampName('nyabinaga-iga-reports', format === 'csv' ? 'csv' : 'xlsx'), {
    bookType: format === 'csv' ? 'csv' : 'xlsx',
  })
}

/** Download an empty template with the correct headers + one example row. */
export function downloadReportTemplate() {
  const headers = REPORT_FIELDS.map((f) => f.excel)
  const example = {}
  REPORT_FIELDS.forEach((f) => {
    example[f.excel] =
      f.key === 'date'
        ? new Date().toISOString().slice(0, 10)
        : f.key === 'pf'
          ? 'PF Germain Uyizeye'
          : f.key === 'clusterName'
            ? 'Nyamasheke'
            : f.key === 'fcpCode'
              ? 'RW0164'
              : f.type === 'number'
                ? 0
                : ''
  })
  const ws = XLSX.utils.json_to_sheet([example], { header: headers })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'IGA Reports')
  XLSX.writeFile(wb, 'nyabinaga-iga-report-template.xlsx')
}

/**
 * Parse a spreadsheet into normalized report entries.
 * @returns {Promise<{ entries: Array, skipped: number, total: number }>}
 */
export async function parseReportsFile(file) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  if (!sheet) return { entries: [], skipped: 0, total: 0 }

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  if (rows.length === 0) return { entries: [], skipped: 0, total: 0 }

  const headers = Object.keys(rows[0])
  const keyByHeader = {}
  headers.forEach((h) => {
    const k = headerToKey(h)
    if (k) keyByHeader[h] = k
  })

  if (Object.keys(keyByHeader).length === 0) {
    throw new Error('No recognizable report columns found. Use the template headers.')
  }

  const entries = []
  let skipped = 0

  for (const row of rows) {
    const raw = {}
    for (const [header, key] of Object.entries(keyByHeader)) raw[key] = row[header]

    // Skip a trailing totals row or empty rows.
    const firstVal = String(raw.date || raw.pf || '').trim().toLowerCase()
    const hasAnyValue = Object.values(raw).some((v) => String(v).trim() !== '')
    if (!hasAnyValue || firstVal === 'totals' || firstVal === 'cluster totals') {
      skipped += 1
      continue
    }
    entries.push(normalizeEntry(raw))
  }

  return { entries, skipped, total: entries.length + skipped }
}
