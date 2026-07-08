// Named members for each staff / committee team on the About page.
//
// Edit the arrays below so every visitor sees the same list. Each member is
// { name, phone?, role? }. Admins can also add members from the site UI;
// those extras are saved in the browser (localStorage) on that device only.

import { staffRoles } from './staff'

const emptyTeams = Object.fromEntries(staffRoles.map((team) => [team.id, []]))

export const staffTeamMembers = {
  ...emptyTeams,
}

const LOCAL_KEY = 'nyabinaga_staff_team_members_added_v1'

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

export function getAddedStaffTeamMembers(teamId) {
  return readLocal()[teamId] || []
}

export function getStaffTeamMembers(teamId) {
  const seed = (staffTeamMembers[teamId] || []).map((m, i) => ({ id: `seed-${teamId}-${i}`, ...m }))
  return [...seed, ...getAddedStaffTeamMembers(teamId)]
}

export function addStaffTeamMember(teamId, { name, phone, role }) {
  const all = readLocal()
  const entry = {
    id: uid(),
    name: String(name || '').trim(),
    phone: String(phone || '').trim(),
    role: String(role || '').trim(),
    added: true,
  }
  all[teamId] = [...(all[teamId] || []), entry]
  writeLocal(all)
  return getStaffTeamMembers(teamId)
}

export function removeAddedStaffTeamMember(teamId, id) {
  const all = readLocal()
  all[teamId] = (all[teamId] || []).filter((m) => m.id !== id)
  writeLocal(all)
  return getStaffTeamMembers(teamId)
}
