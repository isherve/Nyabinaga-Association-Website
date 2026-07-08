// Public member lists for each livehood group (name + phone number).
//
// Built-in seed arrays below ship with the site. Shared members (added by an
// admin or imported from Excel) are stored on the server via /api/members so
// every visitor sees the same list. If the API is unavailable (local dev),
// added members fall back to browser localStorage on that device only.

export const groupMembers = {
  abahamya: [],
  abahujimbaraga: [],
  'twisungane-ruvumbu': [],
  teganyejohazaza: [],
  'twikenure-bunyamanza': [],
  'twikenure-mushungo': [],
  jyambere: [],
  'ubwiza-nyabinaga': [],
  'dukundumurimo-babyeyi': [],
  'tuzamurane-kigarama': [],
  'twitezimbere-ruvumbu': [],
  ngamburuzabukene: [],
  'ejo-heza': [],
}

// Members added by visitors through the public "Members" form are kept in the
// browser (localStorage) and merged with the built-in list above. They persist
// on this device only — a shared backend would be needed to sync across devices.
const LOCAL_KEY = 'nyabinaga_group_members_added_v1'

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeLocal(value) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(value))
  } catch {
    /* storage unavailable — ignore */
  }
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

/** Members added locally for one group. */
export function getAddedMembers(groupId) {
  return readLocal()[groupId] || []
}

/** Built-in seed members plus shared or local additions. */
export function getGroupMembers(groupId, sharedStore = null, fromServer = false) {
  const seed = (groupMembers[groupId] || []).map((m, i) => ({ id: `seed-${groupId}-${i}`, ...m }))
  const added = fromServer
    ? (sharedStore?.[groupId] || [])
    : getAddedMembers(groupId)
  const normalized = added.map((m) => ({
    ...m,
    id: m.id || `remote-${groupId}-${m.name}-${m.phone}`,
    added: m.added !== false,
  }))
  return [...seed, ...normalized]
}

/** Add a member to a group (saved in this browser). Returns the new list. */
export function addGroupMember(groupId, { name, phone, role }) {
  const all = readLocal()
  const entry = {
    id: uid(),
    name: String(name || '').trim(),
    phone: String(phone || '').trim(),
    role: String(role || '').trim(),
    added: true,
  }
  all[groupId] = [...(all[groupId] || []), entry]
  writeLocal(all)
  return getGroupMembers(groupId)
}

/** Remove a locally-added member by id. Returns the new list. */
export function removeAddedMember(groupId, id) {
  const all = readLocal()
  all[groupId] = (all[groupId] || []).filter((m) => m.id !== id)
  writeLocal(all)
  return getGroupMembers(groupId)
}

/** Update a locally-added member by id. Returns the new list. */
export function updateAddedMember(groupId, id, { name, phone, role }) {
  const all = readLocal()
  all[groupId] = (all[groupId] || []).map((m) =>
    m.id === id
      ? {
          ...m,
          name: String(name ?? m.name).trim(),
          phone: String(phone ?? m.phone).trim(),
          role: String(role ?? m.role).trim(),
        }
      : m,
  )
  writeLocal(all)
  return getGroupMembers(groupId)
}

/** Add many members at once (e.g. from an Excel import). Returns the new list. */
export function addGroupMembersBulk(groupId, rows) {
  const all = readLocal()
  const entries = (Array.isArray(rows) ? rows : [])
    .map((r) => ({
      id: uid(),
      name: String(r.name || '').trim(),
      phone: String(r.phone || '').trim(),
      role: String(r.role || '').trim(),
      added: true,
    }))
    .filter((m) => m.name || m.phone)
  all[groupId] = [...(all[groupId] || []), ...entries]
  writeLocal(all)
  return { members: getGroupMembers(groupId), added: entries.length }
}

// Tidy Rwandan phone numbers for display; leave anything else as typed.
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
