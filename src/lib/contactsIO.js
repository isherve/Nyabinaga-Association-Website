// Import/export contacts from Excel (.xlsx) and CSV using SheetJS (xlsx).

import * as XLSX from 'xlsx'
import { normalizePhone } from './phone'

// Header candidates we accept (case/space/underscore-insensitive).
const NAME_HEADERS = ['full name', 'fullname', 'name', 'names', 'contact name', 'amazina']
const PHONE_HEADERS = ['phone number', 'phonenumber', 'phone', 'number', 'mobile', 'tel', 'telephone', 'msisdn', 'nimero']

const norm = (s) => String(s || '').trim().toLowerCase().replace(/[_\s]+/g, ' ')

function pickColumn(headers, candidates) {
  const map = headers.map((h) => norm(h))
  for (const cand of candidates) {
    const idx = map.indexOf(cand)
    if (idx !== -1) return headers[idx]
  }
  // Fallback: partial match (e.g. "Phone Number (MTN)").
  for (let i = 0; i < map.length; i += 1) {
    if (candidates.some((c) => map[i].includes(c))) return headers[i]
  }
  return null
}

/**
 * Parse a spreadsheet file into validated rows.
 * @returns {Promise<{ valid: Array<{name, phone, raw}>, invalid: Array<{name, raw, reason}>, total: number }>}
 */
export async function parseContactsFile(file) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  if (!sheet) return { valid: [], invalid: [], total: 0 }

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  if (rows.length === 0) return { valid: [], invalid: [], total: 0 }

  const headers = Object.keys(rows[0])
  const nameCol = pickColumn(headers, NAME_HEADERS)
  const phoneCol = pickColumn(headers, PHONE_HEADERS)

  if (!phoneCol) {
    throw new Error('Could not find a "Phone Number" column. Add a header named "Phone Number".')
  }

  const valid = []
  const invalid = []

  for (const row of rows) {
    const name = nameCol ? String(row[nameCol] || '').trim() : ''
    const rawPhone = String(row[phoneCol] ?? '').trim()
    if (!rawPhone) continue // skip fully empty rows

    const n = normalizePhone(rawPhone)
    if (n.valid) {
      valid.push({ name, phone: n.e164, raw: rawPhone })
    } else {
      invalid.push({ name, raw: rawPhone, reason: n.reason || 'Invalid' })
    }
  }

  return { valid, invalid, total: valid.length + invalid.length }
}

function timestampName(base, ext) {
  const d = new Date()
  const pad = (x) => String(x).padStart(2, '0')
  return `${base}-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.${ext}`
}

/** Export contacts to .xlsx or .csv (format = 'xlsx' | 'csv'). */
export function exportContacts(contacts, format = 'xlsx') {
  const data = contacts.map((c) => ({ 'Full Name': c.name || '', 'Phone Number': c.phone }))
  const ws = XLSX.utils.json_to_sheet(data, { header: ['Full Name', 'Phone Number'] })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Contacts')
  XLSX.writeFile(wb, timestampName('nyabinaga-contacts', format === 'csv' ? 'csv' : 'xlsx'), {
    bookType: format === 'csv' ? 'csv' : 'xlsx',
  })
}

/** Export SMS history to .xlsx or .csv. */
export function exportHistory(history, format = 'xlsx') {
  const data = history.map((h) => ({
    Timestamp: h.timestamp,
    Name: h.name || '',
    'Phone Number': h.phone,
    Message: h.message,
    Status: h.status,
    'Gateway Response': h.response || '',
  }))
  const ws = XLSX.utils.json_to_sheet(data, {
    header: ['Timestamp', 'Name', 'Phone Number', 'Message', 'Status', 'Gateway Response'],
  })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'SMS History')
  XLSX.writeFile(wb, timestampName('nyabinaga-sms-history', format === 'csv' ? 'csv' : 'xlsx'), {
    bookType: format === 'csv' ? 'csv' : 'xlsx',
  })
}

/** Download a ready-to-fill import template. */
export function downloadTemplate() {
  const ws = XLSX.utils.json_to_sheet(
    [
      { 'Full Name': 'Jean Uwimana', 'Phone Number': '0781011343' },
      { 'Full Name': 'Marie Keza', 'Phone Number': '+250788123456' },
    ],
    { header: ['Full Name', 'Phone Number'] },
  )
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Contacts')
  XLSX.writeFile(wb, 'nyabinaga-contacts-template.xlsx')
}
