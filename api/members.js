// Shared group member lists — visible to every visitor.
//
// Data is stored in Vercel Blob (one JSON file). Set MEMBERS_ADMIN_PASSWORD in
// Vercel → Settings → Environment Variables (use the same value as your admin
// login). Create a Blob store in the Vercel project so BLOB_READ_WRITE_TOKEN
// is available.
//
// GET  /api/members              → { members: { [groupId]: Member[] } }
// POST /api/members              → add | bulk | remove | sync (admin password)

import { head, put } from '@vercel/blob'

const BLOB_PATH = 'nyabinaga-group-members-v1.json'

function adminPassword() {
  return process.env.MEMBERS_ADMIN_PASSWORD || process.env.ADMIN_API_PASSWORD || 'Director@123'
}

function checkPassword(password) {
  return typeof password === 'string' && password === adminPassword()
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

function normalizeMember(raw, id) {
  return {
    id: id || raw.id || uid(),
    name: String(raw.name || '').trim(),
    phone: String(raw.phone || '').trim(),
    role: String(raw.role || '').trim(),
    added: true,
  }
}

async function readStore() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return {}
  try {
    const meta = await head(BLOB_PATH)
    if (!meta?.url) return {}
    const res = await fetch(meta.url, { cache: 'no-store' })
    if (!res.ok) return {}
    const data = await res.json()
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

async function writeStore(members) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_NOT_CONFIGURED')
  }
  await put(BLOB_PATH, JSON.stringify(members), {
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
    const members = await readStore()
    return res.status(200).json({ ok: true, members, shared: Boolean(process.env.BLOB_READ_WRITE_TOKEN) })
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
  const { password, action, groupId, member, members: bulkMembers, id } = body

  if (!checkPassword(password)) {
    return res.status(401).json({ ok: false, error: 'Invalid admin password' })
  }

  if (!groupId && action !== 'sync') {
    return res.status(400).json({ ok: false, error: 'groupId is required' })
  }

  const store = await readStore()

  try {
    if (action === 'sync') {
      const incoming = body.store
      if (!incoming || typeof incoming !== 'object') {
        return res.status(400).json({ ok: false, error: 'store object is required for sync' })
      }
      Object.entries(incoming).forEach(([gid, list]) => {
        if (!Array.isArray(list)) return
        const existing = store[gid] || []
        const existingKeys = new Set(existing.map((m) => `${m.name}|${m.phone}`))
        list.forEach((raw) => {
          const entry = normalizeMember(raw)
          if (!entry.name && !entry.phone) return
          const key = `${entry.name}|${entry.phone}`
          if (existingKeys.has(key)) return
          existingKeys.add(key)
          existing.push(entry)
        })
        store[gid] = existing
      })
      await writeStore(store)
      return res.status(200).json({ ok: true, members: store })
    }

    const list = store[groupId] || []

    if (action === 'add') {
      const entry = normalizeMember(member || {})
      if (!entry.name && !entry.phone) {
        return res.status(400).json({ ok: false, error: 'Name or phone is required' })
      }
      store[groupId] = [...list, entry]
    } else if (action === 'bulk') {
      const rows = Array.isArray(bulkMembers) ? bulkMembers : []
      const entries = rows
        .map((r) => normalizeMember(r))
        .filter((m) => m.name || m.phone)
      if (entries.length === 0) {
        return res.status(400).json({ ok: false, error: 'No valid members in import' })
      }
      store[groupId] = [...list, ...entries]
    } else if (action === 'remove') {
      store[groupId] = list.filter((m) => m.id !== id)
    } else {
      return res.status(400).json({ ok: false, error: 'Unknown action' })
    }

    await writeStore(store)
    return res.status(200).json({ ok: true, members: store, groupMembers: store[groupId] || [] })
  } catch (err) {
    if (err?.message === 'BLOB_NOT_CONFIGURED') {
      return res.status(503).json({ ok: false, error: 'Shared storage not configured' })
    }
    return res.status(500).json({ ok: false, error: err?.message || 'Failed to save members' })
  }
}
