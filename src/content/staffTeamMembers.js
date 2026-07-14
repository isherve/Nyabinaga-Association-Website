// Named members for each staff / committee team on the About page.
//
// Seed arrays below ship with the site. Additions/imports are stored on the
// shared /api/team server when available, otherwise in this browser only.

import { staffRoles } from './staff'
import { readLocalStaffTeams, writeLocalStaffTeams } from '../lib/teamClient'

const emptyTeams = Object.fromEntries(staffRoles.map((team) => [team.id, []]))

export const staffTeamMembers = {
  ...emptyTeams,
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

export function getAddedStaffTeamMembers(teamId) {
  return readLocalStaffTeams()[teamId] || []
}

export function getStaffTeamMembers(teamId, sharedStore = null, fromServer = false) {
  const seed = (staffTeamMembers[teamId] || []).map((m, i) => ({
    id: `seed-${teamId}-${i}`,
    ...m,
  }))
  const added = fromServer
    ? sharedStore?.[teamId] || []
    : getAddedStaffTeamMembers(teamId)
  const normalized = added.map((m) => ({
    ...m,
    id: m.id || `remote-${teamId}-${m.name}-${m.phone}`,
    added: m.added !== false,
  }))
  return [...seed, ...normalized]
}

export function addStaffTeamMember(teamId, { name, phone, role }) {
  const all = readLocalStaffTeams()
  const entry = {
    id: uid(),
    name: String(name || '').trim(),
    phone: String(phone || '').trim(),
    role: String(role || '').trim(),
    added: true,
  }
  all[teamId] = [...(all[teamId] || []), entry]
  writeLocalStaffTeams(all)
  return getStaffTeamMembers(teamId)
}

export function addStaffTeamMembersBulk(teamId, rows) {
  const all = readLocalStaffTeams()
  const entries = (Array.isArray(rows) ? rows : [])
    .map((r) => ({
      id: uid(),
      name: String(r.name || '').trim(),
      phone: String(r.phone || '').trim(),
      role: String(r.role || '').trim(),
      added: true,
    }))
    .filter((m) => m.name || m.phone)
  all[teamId] = [...(all[teamId] || []), ...entries]
  writeLocalStaffTeams(all)
  return { members: getStaffTeamMembers(teamId), added: entries.length }
}

export function updateStaffTeamMember(teamId, id, { name, phone, role }) {
  const all = readLocalStaffTeams()
  all[teamId] = (all[teamId] || []).map((m) =>
    m.id === id
      ? {
          ...m,
          name: String(name ?? m.name).trim(),
          phone: String(phone ?? m.phone).trim(),
          role: String(role ?? m.role).trim(),
        }
      : m,
  )
  writeLocalStaffTeams(all)
  return getStaffTeamMembers(teamId)
}

export function removeAddedStaffTeamMember(teamId, id) {
  const all = readLocalStaffTeams()
  all[teamId] = (all[teamId] || []).filter((m) => m.id !== id)
  writeLocalStaffTeams(all)
  return getStaffTeamMembers(teamId)
}
