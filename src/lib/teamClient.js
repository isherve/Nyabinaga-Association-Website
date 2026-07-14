// Client for shared /api/team (leadership bios/photos + staff teams).

import { ACCESS } from '../config/access'
import { getStoredAdminPassword } from './membersClient'

const STAFF_LOCAL_KEY = 'nyabinaga_staff_team_members_added_v1'
const STAFF_SYNCED_KEY = 'nyabinaga_staff_team_synced_v1'
const LEADER_LOCAL_KEY = 'nyabinaga_leadership_overrides_v2'
const LEADER_SYNCED_KEY = 'nyabinaga_leadership_synced_v1'

export function isLocalDev() {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1'
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

export function readLocalLeadership() {
  return readJson(LEADER_LOCAL_KEY, {})
}

export function writeLocalLeadership(value) {
  writeJson(LEADER_LOCAL_KEY, value)
}

export function readLocalStaffTeams() {
  return readJson(STAFF_LOCAL_KEY, {})
}

export function writeLocalStaffTeams(value) {
  writeJson(STAFF_LOCAL_KEY, value)
}

export async function fetchSharedTeamData() {
  try {
    const res = await fetch('/api/team', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      return {
        leadership: data?.leadership && typeof data.leadership === 'object' ? data.leadership : {},
        staffTeams: data?.staffTeams && typeof data.staffTeams === 'object' ? data.staffTeams : {},
        shared: Boolean(data?.shared),
      }
    }
  } catch {
    /* local / offline */
  }
  return { leadership: {}, staffTeams: {}, shared: false }
}

async function postTeam(body) {
  const password = getStoredAdminPassword() || ACCESS.adminPassword
  const res = await fetch('/api/team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Save failed (${res.status})`)
  return data
}

export async function updateSharedLeader(name, { bio, photo }) {
  return postTeam({ action: 'update-leader', name, bio, photo })
}

export async function addSharedStaffMember(teamId, member) {
  return postTeam({ action: 'staff-add', teamId, member })
}

export async function addSharedStaffMembersBulk(teamId, members) {
  return postTeam({ action: 'staff-bulk', teamId, members })
}

export async function updateSharedStaffMember(teamId, id, member) {
  return postTeam({ action: 'staff-update', teamId, id, member })
}

export async function removeSharedStaffMember(teamId, id) {
  return postTeam({ action: 'staff-remove', teamId, id })
}

export async function syncLocalTeamDataToServer() {
  const staffSynced = localStorage.getItem(STAFF_SYNCED_KEY) === '1'
  const leaderSynced = localStorage.getItem(LEADER_SYNCED_KEY) === '1'
  if (staffSynced && leaderSynced) return null

  let result = null
  const localStaff = readLocalStaffTeams()
  const hasStaff = Object.values(localStaff).some((list) => Array.isArray(list) && list.length > 0)
  if (!staffSynced && hasStaff) {
    result = await postTeam({ action: 'staff-sync', store: localStaff })
    localStorage.setItem(STAFF_SYNCED_KEY, '1')
  } else if (!staffSynced) {
    localStorage.setItem(STAFF_SYNCED_KEY, '1')
  }

  const localLeaders = readLocalLeadership()
  if (!leaderSynced && Object.keys(localLeaders).length > 0) {
    for (const [key, value] of Object.entries(localLeaders)) {
      // eslint-disable-next-line no-await-in-loop
      result = await postTeam({
        action: 'update-leader',
        name: key.replace(/-/g, ' '),
        bio: value.bio,
        photo: value.photo,
      })
    }
    localStorage.setItem(LEADER_SYNCED_KEY, '1')
  } else if (!leaderSynced) {
    localStorage.setItem(LEADER_SYNCED_KEY, '1')
  }

  return result
}

/** Compress an image file to a JPEG data URL suitable for profile photos. */
export function compressImageToDataUrl(file, maxSize = 480, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) {
      reject(new Error('Please choose an image file'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read image'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not load image'))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
