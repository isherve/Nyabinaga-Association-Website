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

/** Members for one group (empty array if none listed yet). */
export function getGroupMembers(groupId) {
  return groupMembers[groupId] || []
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
