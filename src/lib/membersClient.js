// Client for the shared /api/members endpoint (Vercel Blob backend).

import { ACCESS } from '../config/access'

const LOCAL_KEY = 'nyabinaga_group_members_added_v1'
const SYNCED_KEY = 'nyabinaga_group_members_synced_v1'
const ADMIN_PW_KEY = 'nyabinaga_admin_pw_v1'

export function getStoredAdminPassword() {
  try {
    return sessionStorage.getItem(ADMIN_PW_KEY) || ''
  } catch {
    return ''
  }
}

export function storeAdminPassword(password) {
  try {
    if (password) sessionStorage.setItem(ADMIN_PW_KEY, password)
    else sessionStorage.removeItem(ADMIN_PW_KEY)
  } catch {
    /* ignore */
  }
}

function readLocalStore() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function markSynced() {
  try {
    localStorage.setItem(SYNCED_KEY, '1')
  } catch {
    /* ignore */
  }
}

function wasSynced() {
  try {
    return localStorage.getItem(SYNCED_KEY) === '1'
  } catch {
    return false
  }
}

/** Load shared members from the API, with static JSON fallback. */
export async function fetchSharedMembers() {
  try {
    const res = await fetch('/api/members', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (data?.members && typeof data.members === 'object') {
        return { members: data.members, shared: Boolean(data.shared) }
      }
    }
  } catch {
    /* API unavailable in local dev — fall through */
  }

  try {
    const res = await fetch('/data/group-members.json', { cache: 'no-store' })
    if (res.ok) {
      const members = await res.json()
      if (members && typeof members === 'object') {
        return { members, shared: false }
      }
    }
  } catch {
    /* ignore */
  }

  return { members: {}, shared: false }
}

async function postMembers(body) {
  const password = getStoredAdminPassword() || ACCESS.adminPassword
  const res = await fetch('/api/members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Save failed (${res.status})`)
  }
  return data
}

export async function addSharedMember(groupId, member) {
  return postMembers({ action: 'add', groupId, member })
}

export async function addSharedMembersBulk(groupId, rows) {
  return postMembers({ action: 'bulk', groupId, members: rows })
}

export async function removeSharedMember(groupId, id) {
  return postMembers({ action: 'remove', groupId, id })
}

/** One-time upload of browser-only members so everyone can see them. */
export async function syncLocalMembersToServer() {
  if (wasSynced()) return null
  const local = readLocalStore()
  const hasData = Object.values(local).some((list) => Array.isArray(list) && list.length > 0)
  if (!hasData) {
    markSynced()
    return null
  }
  const data = await postMembers({ action: 'sync', store: local })
  markSynced()
  return data.members
}
