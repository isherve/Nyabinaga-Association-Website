// Public member lists for each livelihood group (name + phone number).
//
// This data ships with the site, so every visitor sees the same members on
// every device (unlike the old browser-only admin storage). To update a group,
// edit its array below: each member is { name, phone, role? }.
//
// Phone numbers can be written in any of these forms — they are auto-formatted
// for display: "+250788123456", "0788123456", or "+250 788 123 456".

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

/** Built-in members plus any added on this device. */
export function getGroupMembers(groupId) {
  const seed = (groupMembers[groupId] || []).map((m, i) => ({ id: `seed-${groupId}-${i}`, ...m }))
  return [...seed, ...getAddedMembers(groupId)]
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
