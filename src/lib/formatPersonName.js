/** Format: MUNYANSANGA Jerome, BIZUMUTIMANA Jean marie */
export function formatPersonName(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return ''

  const family = parts[0].toUpperCase()
  const given = parts.slice(1).map((word, i) => {
    const lower = word.toLowerCase()
    if (i === 0) return lower.charAt(0).toUpperCase() + lower.slice(1)
    return lower
  })

  return [family, ...given].join(' ')
}
