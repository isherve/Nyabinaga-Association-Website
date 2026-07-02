// Phone number helpers for Rwanda-first SMS sending.
//
// Rwanda mobile numbers have 9 national digits starting with 7 (e.g. 78x, 79x,
// 72x, 73x). Users commonly write them as:
//   - Local:         0781011343      (leading 0 + 9 digits)
//   - International:  +250781011343   (E.164)
//   - Bare national:  781011343       (9 digits, no prefix)
//
// normalizePhone() converts any of these to E.164 (+250781011343) and validates.

const DEFAULT_COUNTRY = '250'

// Rwanda mobile prefixes (first digit of the 9-digit national number is always 7).
const RW_MOBILE_RE = /^7\d{8}$/

/** Strip everything except digits and a single leading "+". */
export function cleanPhone(raw) {
  if (raw == null) return ''
  let s = String(raw).trim()
  // Some spreadsheets store numbers in scientific notation or with a trailing ".0".
  if (/e\+?\d+$/i.test(s)) {
    const n = Number(s)
    if (Number.isFinite(n)) s = n.toFixed(0)
  }
  s = s.replace(/\.0+$/, '')
  const hasPlus = s.trim().startsWith('+') || s.trim().startsWith('00')
  const digits = s.replace(/\D/g, '').replace(/^00/, '')
  return hasPlus ? `+${digits}` : digits
}

/**
 * Normalize a raw phone string to E.164.
 * @returns {{ valid: boolean, e164: string, national: string, reason?: string, input: string }}
 */
export function normalizePhone(raw, defaultCountry = DEFAULT_COUNTRY) {
  const input = raw == null ? '' : String(raw).trim()
  const cleaned = cleanPhone(raw)

  if (!cleaned || cleaned === '+') {
    return { valid: false, e164: '', national: '', reason: 'Empty', input }
  }

  let digits = cleaned.replace('+', '')

  // Local format: leading 0 + national number → replace the 0 with country code.
  if (digits.startsWith('0')) {
    digits = defaultCountry + digits.slice(1)
  } else if (digits.length <= 9) {
    // Bare national number (no country code, no leading 0).
    digits = defaultCountry + digits
  }
  // Otherwise it already carries a country code (e.g. 250..., +250...).

  const e164 = `+${digits}`

  // Rwanda-specific validation.
  if (digits.startsWith(DEFAULT_COUNTRY)) {
    const national = digits.slice(DEFAULT_COUNTRY.length)
    if (!RW_MOBILE_RE.test(national)) {
      return {
        valid: false,
        e164,
        national,
        reason: 'Not a valid Rwandan mobile number',
        input,
      }
    }
    return { valid: true, e164, national, input }
  }

  // Other countries: accept a plausible E.164 length (8–15 digits).
  if (digits.length >= 8 && digits.length <= 15) {
    return { valid: true, e164, national: digits, input }
  }

  return { valid: false, e164, national: digits, reason: 'Unrecognized number format', input }
}

/** Convenience: true if the number normalizes to a valid E.164 value. */
export function isValidPhone(raw, defaultCountry = DEFAULT_COUNTRY) {
  return normalizePhone(raw, defaultCountry).valid
}

/** Pretty display form, e.g. +250 781 011 343. */
export function formatPhoneDisplay(e164) {
  if (!e164) return ''
  const m = /^\+250(\d{3})(\d{3})(\d{3})$/.exec(e164)
  if (m) return `+250 ${m[1]} ${m[2]} ${m[3]}`
  return e164
}

/** GSM-7 message length → number of SMS segments. */
export function smsSegments(message) {
  const len = (message || '').length
  if (len === 0) return 0
  if (len <= 160) return 1
  return Math.ceil(len / 153) // concatenated SMS use 153 chars/segment
}
