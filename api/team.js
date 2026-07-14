// Shared leadership bios/photos + staff-team member lists (Vercel Blob).
//
// GET  /api/team
// POST /api/team  { password, action, ... }
//
// Actions:
//   update-leader  { name, bio?, photo? }
//   staff-add | staff-bulk | staff-update | staff-remove | staff-sync

import { head, put } from '@vercel/blob'

const BLOB_PATH = 'nyabinaga-team-data-v1.json'

function adminPassword() {
  return process.env.MEMBERS_ADMIN_PASSWORD || process.env.ADMIN_API_PASSWORD || 'Director@123'
}

function checkPassword(password) {
  return typeof password === 'string' && password === adminPassword()
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

function leaderKey(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
}

function normalizeMember(raw, id) {
  return {
    id: id || raw.id || uid(),
    name: String(raw.name || '').trim(),
    phone: String(raw.phone || '').trim(),
    role: String(raw.role || '').trim(),
    added: true,
  }
}

function emptyStore() {
  return { leadership: {}, staffTeams: {} }
}

async function readStore() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return emptyStore()
  try {
    const meta = await head(BLOB_PATH)
    if (!meta?.url) return emptyStore()
    const res = await fetch(meta.url, { cache: 'no-store' })
    if (!res.ok) return emptyStore()
    const data = await res.json()
    return {
      leadership: data?.leadership && typeof data.leadership === 'object' ? data.leadership : {},
      staffTeams: data?.staffTeams && typeof data.staffTeams === 'object' ? data.staffTeams : {},
    }
  } catch {
    return emptyStore()
  }
}

async function writeStore(store) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_NOT_CONFIGURED')
  await put(BLOB_PATH, JSON.stringify(store), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

function parseBody(req) {
  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = {}
    }
  }
  return body || {}
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const store = await readStore()
    return res.status(200).json({
      ok: true,
      shared: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      leadership: store.leadership,
      staffTeams: store.staffTeams,
    })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      ok: false,
      error: 'Shared storage not configured. Add a Vercel Blob store to this project.',
    })
  }

  const body = parseBody(req)
  const { password, action } = body
  if (!checkPassword(password)) {
    return res.status(401).json({ ok: false, error: 'Invalid admin password' })
  }

  const store = await readStore()

  try {
    if (action === 'update-leader') {
      const key = leaderKey(body.name)
      if (!key) return res.status(400).json({ ok: false, error: 'name is required' })
      const prev = store.leadership[key] || {}
      const next = { ...prev }
      if (typeof body.bio === 'string') next.bio = body.bio.trim()
      if (typeof body.photo === 'string') next.photo = body.photo.trim()
      store.leadership[key] = next
    } else if (action === 'staff-sync') {
      const incoming = body.store
      if (!incoming || typeof incoming !== 'object') {
        return res.status(400).json({ ok: false, error: 'store object is required for sync' })
      }
      Object.entries(incoming).forEach(([teamId, list]) => {
        if (!Array.isArray(list)) return
        const existing = store.staffTeams[teamId] || []
        const keys = new Set(existing.map((m) => `${m.name}|${m.phone}`))
        list.forEach((raw) => {
          const entry = normalizeMember(raw)
          if (!entry.name && !entry.phone) return
          const k = `${entry.name}|${entry.phone}`
          if (keys.has(k)) return
          keys.add(k)
          existing.push(entry)
        })
        store.staffTeams[teamId] = existing
      })
    } else if (action === 'staff-add') {
      const { teamId, member } = body
      if (!teamId) return res.status(400).json({ ok: false, error: 'teamId is required' })
      const entry = normalizeMember(member || {})
      if (!entry.name && !entry.phone) {
        return res.status(400).json({ ok: false, error: 'Name or phone is required' })
      }
      store.staffTeams[teamId] = [...(store.staffTeams[teamId] || []), entry]
    } else if (action === 'staff-bulk') {
      const { teamId, members } = body
      if (!teamId) return res.status(400).json({ ok: false, error: 'teamId is required' })
      const entries = (Array.isArray(members) ? members : [])
        .map((r) => normalizeMember(r))
        .filter((m) => m.name || m.phone)
      if (!entries.length) {
        return res.status(400).json({ ok: false, error: 'No valid members in import' })
      }
      store.staffTeams[teamId] = [...(store.staffTeams[teamId] || []), ...entries]
    } else if (action === 'staff-update') {
      const { teamId, id, member } = body
      if (!teamId || !id) return res.status(400).json({ ok: false, error: 'teamId and id are required' })
      const list = store.staffTeams[teamId] || []
      const idx = list.findIndex((m) => m.id === id)
      if (idx === -1) return res.status(404).json({ ok: false, error: 'Member not found' })
      const entry = normalizeMember({ ...list[idx], ...(member || {}) }, id)
      if (!entry.name && !entry.phone) {
        return res.status(400).json({ ok: false, error: 'Name or phone is required' })
      }
      const next = [...list]
      next[idx] = entry
      store.staffTeams[teamId] = next
    } else if (action === 'staff-remove') {
      const { teamId, id } = body
      if (!teamId || !id) return res.status(400).json({ ok: false, error: 'teamId and id are required' })
      store.staffTeams[teamId] = (store.staffTeams[teamId] || []).filter((m) => m.id !== id)
    } else {
      return res.status(400).json({ ok: false, error: 'Unknown action' })
    }

    await writeStore(store)
    return res.status(200).json({
      ok: true,
      leadership: store.leadership,
      staffTeams: store.staffTeams,
    })
  } catch (err) {
    if (err?.message === 'BLOB_NOT_CONFIGURED') {
      return res.status(503).json({ ok: false, error: 'Shared storage not configured' })
    }
    return res.status(500).json({ ok: false, error: err?.message || 'Failed to save team data' })
  }
}
