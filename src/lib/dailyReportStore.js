// Local persistence for staff Daily Work Reports.
//
// Each entry captures the work a staff member completed during one day:
// summary, an itemized task list (with per-task status), hours worked,
// challenges faced and the plan for the next day. Stored in the browser
// (localStorage) — same no-backend approach as the SMS Center and IGA Reports.
// Swap these functions for API/DB calls later if a shared database is added.

const KEY = 'nyabinaga_daily_reports_v1'

// The Compassion International staff who file reports / attend meetings.
export const STAFF_ROLES = [
  'Director',
  'PCD',
  'Accountant (Contable)',
  'Doctor',
  'Child Survival Project (CSP)',
]

export const TASK_STATUSES = [
  { id: 'done', label: 'Completed' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'pending', label: 'Pending' },
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

const cleanTasks = (tasks) =>
  (Array.isArray(tasks) ? tasks : [])
    .map((task) => ({
      title: String(task.title || '').trim(),
      status: TASK_STATUSES.some((s) => s.id === task.status) ? task.status : 'done',
    }))
    .filter((task) => task.title !== '')

export function normalizeDaily(raw) {
  return {
    id: raw.id || uid(),
    createdAt: raw.createdAt || new Date().toISOString(),
    date: raw.date || new Date().toISOString().slice(0, 10),
    staffName: String(raw.staffName || '').trim(),
    role: STAFF_ROLES.includes(raw.role) ? raw.role : raw.role || STAFF_ROLES[0],
    summary: String(raw.summary || '').trim(),
    tasks: cleanTasks(raw.tasks),
    hours: raw.hours === '' || raw.hours == null ? '' : Number(raw.hours) || 0,
    challenges: String(raw.challenges || '').trim(),
    tomorrow: String(raw.tomorrow || '').trim(),
  }
}

export function getDailyReports() {
  return read()
}

export function addDaily(existing, raw) {
  const entry = normalizeDaily(raw)
  const next = [entry, ...existing]
  write(next)
  return { reports: next, entry }
}

export function updateDaily(existing, id, raw) {
  const next = existing.map((r) => (r.id === id ? normalizeDaily({ ...r, ...raw, id }) : r))
  write(next)
  return next
}

export function removeDaily(existing, id) {
  const next = existing.filter((r) => r.id !== id)
  write(next)
  return next
}

export function clearDaily() {
  write([])
  return []
}

export function taskLabel(statusId) {
  return TASK_STATUSES.find((s) => s.id === statusId)?.label || statusId
}
