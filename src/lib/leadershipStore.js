// Leadership role descriptions (bios) for the About page team section.
//
// Seed bios (src/content/staff.js) ship with the site. Edits saved from the
// role-details modal are stored in the browser (localStorage) on that device only.

import { leadership as leadershipSeed } from '../content/staff'

const KEY = 'nyabinaga_leadership_bios_v1'

function leaderKey(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
}

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function write(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    /* storage unavailable — ignore */
  }
}

export function getLeadership() {
  const overrides = read()
  return leadershipSeed.map((leader) => ({
    ...leader,
    bio: overrides[leaderKey(leader.name)] ?? leader.bio,
  }))
}

export function updateLeaderBio(name, bio) {
  const key = leaderKey(name)
  const overrides = { ...read(), [key]: String(bio || '').trim() }
  write(overrides)
  return getLeadership()
}
