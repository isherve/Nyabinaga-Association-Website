// Local persistence for group member lists (name + phone number).
//
// Members are stored as a flat array tagged with their groupId, kept in the
// browser (localStorage) — the same no-backend approach as the other admin
// tools. Phone numbers are private, so the public site only reveals member
// lists inside the password-gated group details. Swap for an API/DB later.

const KEY = 'nyabinaga_group_members_v1'

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function write(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    /* storage unavailable — ignore */
  }
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

// Normalize Rwandan phone numbers to a tidy display form; keep other input as-is.
export function formatPhone(raw) {
  const s = String(raw || '').trim()
  if (!s) return ''
  const digits = s.replace(/[^\d+]/g, '')
  if (/^\+?250\d{9}$/.test(digits)) {
    const local = digits.replace(/^\+?250/, '')
    return `+250 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
  }
  if (/^0\d{9}$/.test(digits)) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }
  return s
}

export function normalizeMember(raw) {
  return {
    id: raw.id || uid(),
    groupId: String(raw.groupId || '').trim(),
    name: String(raw.name || '').trim(),
    phone: String(raw.phone || '').trim(),
    role: String(raw.role || '').trim(),
  }
}

export function getAllMembers() {
  return read()
}

/** Members belonging to one group, sorted by name. */
export function getGroupMembers(groupId) {
  return read()
    .filter((m) => m.groupId === groupId)
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Map of groupId -> member count, for badges/summaries. */
export function getMemberCounts() {
  const counts = {}
  for (const m of read()) counts[m.groupId] = (counts[m.groupId] || 0) + 1
  return counts
}

export function addMember(raw) {
  const entry = normalizeMember(raw)
  write([...read(), entry])
  return entry
}

export function updateMember(id, raw) {
  const next = read().map((m) => (m.id === id ? normalizeMember({ ...m, ...raw, id }) : m))
  write(next)
  return next
}

export function removeMember(id) {
  const next = read().filter((m) => m.id !== id)
  write(next)
  return next
}

/** Replace every member of one group (used after import). */
export function replaceGroupMembers(groupId, members) {
  const others = read().filter((m) => m.groupId !== groupId)
  const cleaned = members
    .map((m) => normalizeMember({ ...m, groupId }))
    .filter((m) => m.name || m.phone)
  const next = [...others, ...cleaned]
  write(next)
  return next
}

export function clearGroupMembers(groupId) {
  const next = read().filter((m) => m.groupId !== groupId)
  write(next)
  return next
}
