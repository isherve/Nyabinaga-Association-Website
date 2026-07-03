// Local persistence for staff Meeting Management.
//
// Schedule, organize and track meetings between the four Compassion
// International staff members. Stored in the browser (localStorage) — the same
// no-backend approach as the other admin tools. Swap for API/DB calls later.

import { STAFF_ROLES } from './dailyReportStore'

const KEY = 'nyabinaga_meetings_v1'

export { STAFF_ROLES }

export const MEETING_STATUSES = [
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

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

export function normalizeMeeting(raw) {
  const attendees = Array.isArray(raw.attendees)
    ? raw.attendees.filter((a) => STAFF_ROLES.includes(a))
    : STAFF_ROLES.slice()
  return {
    id: raw.id || uid(),
    createdAt: raw.createdAt || new Date().toISOString(),
    title: String(raw.title || '').trim(),
    date: raw.date || new Date().toISOString().slice(0, 10),
    time: raw.time || '09:00',
    duration: raw.duration === '' || raw.duration == null ? 60 : Number(raw.duration) || 60,
    location: String(raw.location || '').trim(),
    organizer: STAFF_ROLES.includes(raw.organizer) ? raw.organizer : raw.organizer || STAFF_ROLES[0],
    attendees,
    agenda: String(raw.agenda || '').trim(),
    minutes: String(raw.minutes || '').trim(),
    status: MEETING_STATUSES.some((s) => s.id === raw.status) ? raw.status : 'scheduled',
  }
}

/** Sort by date+time ascending so upcoming meetings surface first. */
function sortByWhen(list) {
  return [...list].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
}

export function getMeetings() {
  return sortByWhen(read())
}

export function addMeeting(existing, raw) {
  const entry = normalizeMeeting(raw)
  const next = sortByWhen([entry, ...existing])
  write(next)
  return { meetings: next, entry }
}

export function updateMeeting(existing, id, raw) {
  const next = sortByWhen(existing.map((m) => (m.id === id ? normalizeMeeting({ ...m, ...raw, id }) : m)))
  write(next)
  return next
}

export function setMeetingStatus(existing, id, status) {
  return updateMeeting(existing, id, { ...(existing.find((m) => m.id === id) || {}), status })
}

export function removeMeeting(existing, id) {
  const next = existing.filter((m) => m.id !== id)
  write(next)
  return next
}

export function clearMeetings() {
  write([])
  return []
}

export function statusLabel(statusId) {
  return MEETING_STATUSES.find((s) => s.id === statusId)?.label || statusId
}
