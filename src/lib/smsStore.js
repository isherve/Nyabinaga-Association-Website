// Local persistence for SMS contacts and message history.
//
// v1 stores data in the browser's localStorage on the admin's device. This keeps
// the feature usable with zero extra accounts. For shared, multi-device data and
// server-side delivery webhooks, swap these functions to call a database
// (e.g. Supabase) — the rest of the UI does not need to change.

import { normalizePhone } from './phone'

const CONTACTS_KEY = 'nyabinaga_sms_contacts_v1'
const HISTORY_KEY = 'nyabinaga_sms_history_v1'

function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full / unavailable — ignore */
  }
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

/* ------------------------------- Contacts ------------------------------- */

export function getContacts() {
  return read(CONTACTS_KEY)
}

export function saveContacts(contacts) {
  write(CONTACTS_KEY, contacts)
  return contacts
}

/**
 * Merge new contacts in, de-duplicating by E.164 phone number.
 * @param existing current contacts
 * @param incoming array of { name, phone } (raw phone allowed)
 * @returns { contacts, added, skipped }
 */
export function mergeContacts(existing, incoming) {
  const byPhone = new Map(existing.map((c) => [c.phone, c]))
  let added = 0
  let skipped = 0

  for (const item of incoming) {
    const norm = normalizePhone(item.phone)
    if (!norm.valid) {
      skipped += 1
      continue
    }
    if (byPhone.has(norm.e164)) {
      skipped += 1
      // Fill in a name if we previously had none.
      const prev = byPhone.get(norm.e164)
      if (!prev.name && item.name) prev.name = String(item.name).trim()
      continue
    }
    const contact = {
      id: uid(),
      name: (item.name || '').toString().trim(),
      phone: norm.e164,
      createdAt: new Date().toISOString(),
    }
    byPhone.set(norm.e164, contact)
    added += 1
  }

  return { contacts: Array.from(byPhone.values()), added, skipped }
}

export function addContact(existing, name, phone) {
  return mergeContacts(existing, [{ name, phone }])
}

export function removeContact(existing, id) {
  return existing.filter((c) => c.id !== id)
}

export function clearContacts() {
  write(CONTACTS_KEY, [])
  return []
}

/* -------------------------------- History -------------------------------- */

export function getHistory() {
  return read(HISTORY_KEY)
}

/**
 * Append a history record and return the updated (newest-first) list.
 * @param entry { phone, name, message, status, response, batchId }
 */
export function addHistory(entry) {
  const history = read(HISTORY_KEY)
  const record = {
    id: uid(),
    timestamp: new Date().toISOString(),
    status: 'pending',
    ...entry,
  }
  const next = [record, ...history].slice(0, 2000) // cap growth
  write(HISTORY_KEY, next)
  return { history: next, record }
}

export function updateHistory(id, patch) {
  const history = read(HISTORY_KEY)
  const next = history.map((h) => (h.id === id ? { ...h, ...patch } : h))
  write(HISTORY_KEY, next)
  return next
}

export function clearHistory() {
  write(HISTORY_KEY, [])
  return []
}
