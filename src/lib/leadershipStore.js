// Leadership bios + photos for the About page team section.
//
// Seed data ships from src/content/staff.js. Overrides come from shared
// /api/team (preferred) or local browser storage as a fallback.

import { leadership as leadershipSeed } from '../content/staff'
import {
  readLocalLeadership,
  writeLocalLeadership,
} from './teamClient'

function leaderKey(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
}

export function getLeadership(sharedOverrides = null) {
  const local = readLocalLeadership()
  // Migrate old bio-only key if present.
  try {
    const legacy = localStorage.getItem('nyabinaga_leadership_bios_v1')
    if (legacy && Object.keys(local).length === 0) {
      const bios = JSON.parse(legacy)
      const migrated = {}
      Object.entries(bios).forEach(([k, bio]) => {
        migrated[k] = { bio }
      })
      writeLocalLeadership(migrated)
      Object.assign(local, migrated)
    }
  } catch {
    /* ignore */
  }

  const overrides = sharedOverrides && Object.keys(sharedOverrides).length ? sharedOverrides : local

  return leadershipSeed.map((leader) => {
    const key = leaderKey(leader.name)
    const over = overrides[key] || {}
    return {
      ...leader,
      bio: typeof over.bio === 'string' ? over.bio : leader.bio,
      photo: typeof over.photo === 'string' && over.photo ? over.photo : leader.photo,
    }
  })
}

export function updateLeaderLocal(name, { bio, photo }) {
  const key = leaderKey(name)
  const all = { ...readLocalLeadership() }
  const prev = all[key] || {}
  const next = { ...prev }
  if (typeof bio === 'string') next.bio = bio.trim()
  if (typeof photo === 'string') next.photo = photo.trim()
  all[key] = next
  writeLocalLeadership(all)
  return getLeadership()
}

export function updateLeaderBio(name, bio) {
  return updateLeaderLocal(name, { bio })
}

export function updateLeaderPhoto(name, photo) {
  return updateLeaderLocal(name, { photo })
}

export { leaderKey }
