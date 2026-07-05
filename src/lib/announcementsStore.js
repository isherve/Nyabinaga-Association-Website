// Persistence for Pastors Room announcements.
//
// Seed announcements (src/content/announcements.js) ship with the site and are
// visible to everyone. Announcements published from the page are saved in the
// browser (localStorage) and merged on top — they persist on that device only.
// A shared backend would be needed to broadcast new posts to every visitor.

import { announcementsSeed } from '../content/announcements'

const KEY = 'nyabinaga_announcements_v1'

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

export function normalizeAnnouncement(raw) {
  return {
    id: raw.id || uid(),
    title: String(raw.title || '').trim(),
    body: String(raw.body || '').trim(),
    author: String(raw.author || '').trim(),
    date: raw.date || new Date().toISOString().slice(0, 10),
    createdAt: raw.createdAt || new Date().toISOString(),
    pinned: Boolean(raw.pinned),
    published: raw.published !== false, // locally-created posts are "published"
  }
}

// Sort: pinned first, then newest date first.
function sortPosts(list) {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return String(b.date).localeCompare(String(a.date))
  })
}

/** Seed + locally published announcements, sorted for display. */
export function getAnnouncements() {
  const seed = announcementsSeed.map((a) => ({
    ...a,
    createdAt: a.createdAt || `${a.date}T00:00:00.000Z`,
    published: true,
    seed: true,
  }))
  return sortPosts([...read(), ...seed])
}

/**
 * Announcements to surface on the homepage: only those posted within the last
 * `hours` (default 24). After that window they automatically disappear until a
 * newer announcement is posted.
 */
export function getHomepageAnnouncements(hours = 24) {
  const cutoff = Date.now() - hours * 60 * 60 * 1000
  return getAnnouncements().filter((a) => {
    const ts = Date.parse(a.createdAt || a.date)
    return Number.isFinite(ts) && ts >= cutoff
  })
}

export function addAnnouncement(raw) {
  const entry = normalizeAnnouncement(raw)
  write([entry, ...read()])
  return getAnnouncements()
}

export function updateAnnouncement(id, raw) {
  write(read().map((a) => (a.id === id ? normalizeAnnouncement({ ...a, ...raw, id }) : a)))
  return getAnnouncements()
}

export function removeAnnouncement(id) {
  write(read().filter((a) => a.id !== id))
  return getAnnouncements()
}
