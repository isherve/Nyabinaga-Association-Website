// Vercel serverless function: send ONE SMS via the configured gateway.
//
// The frontend calls this endpoint once per recipient (giving live 1/N progress
// and guaranteeing one SMS request per phone number). API credentials live only
// in Vercel environment variables and are never exposed to the browser.
//
// Required environment variables (set in Vercel → Project → Settings → Environment):
//   SMS_SEND_PASSWORD   A shared secret the admin types in the UI at send time.
//                       Requests without the correct value are rejected. This is
//                       what stops the public endpoint from being abused.
//   SMS_PROVIDER        "africastalking" (default) or "twilio".
//
//   For Africa's Talking:
//     AT_API_KEY        Your API key.
//     AT_USERNAME       Your username ("sandbox" for the test environment).
//     AT_ENV            "production" or "sandbox" (default "sandbox").
//     AT_SENDER_ID      Optional registered sender ID / short code.
//
//   For Twilio:
//     TWILIO_ACCOUNT_SID
//     TWILIO_AUTH_TOKEN
//     TWILIO_FROM       Your Twilio phone number in E.164 (e.g. +1512...).

// Best-effort in-memory rate limiter (per warm serverless instance). For strict,
// global limits you'd back this with a shared store (Redis/Upstash).
const RATE = { windowMs: 60_000, max: 60, hits: [] }

function rateLimited() {
  const now = Date.now()
  RATE.hits = RATE.hits.filter((t) => now - t < RATE.windowMs)
  if (RATE.hits.length >= RATE.max) return true
  RATE.hits.push(now)
  return false
}

function isValidE164(to) {
  return typeof to === 'string' && /^\+\d{8,15}$/.test(to)
}

async function sendViaAfricasTalking({ to, message }) {
  const apiKey = process.env.AT_API_KEY
  const username = process.env.AT_USERNAME || 'sandbox'
  const env = (process.env.AT_ENV || 'sandbox').toLowerCase()
  const senderId = process.env.AT_SENDER_ID

  if (!apiKey) return { ok: false, status: 'failed', response: 'AT_API_KEY not configured' }

  const endpoint =
    env === 'production'
      ? 'https://api.africastalking.com/version1/messaging'
      : 'https://api.sandbox.africastalking.com/version1/messaging'

  const params = new URLSearchParams({ username, to, message })
  // Sandbox: omit `from` unless you set AT_SENDER_ID (some accounts reject "Sandbox").
  if (senderId) params.set('from', senderId)

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params.toString(),
  })

  const data = await res.json().catch(() => ({}))
  const recipient = data?.SMSMessageData?.Recipients?.[0]
  const ok = res.ok && recipient?.status === 'Success'

  return {
    ok,
    status: ok ? 'sent' : 'failed',
    messageId: recipient?.messageId || null,
    cost: recipient?.cost || null,
    response:
      recipient?.status ||
      data?.SMSMessageData?.Message ||
      data?.errorMessage ||
      data?.message ||
      (typeof data === 'string' ? data : null) ||
      `HTTP ${res.status}`,
    raw: data,
  }
}

async function sendViaTwilio({ to, message }) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM

  if (!sid || !token || !from) {
    return { ok: false, status: 'failed', response: 'Twilio credentials not configured' }
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`
  const body = new URLSearchParams({ To: to, From: from, Body: message })
  const auth = Buffer.from(`${sid}:${token}`).toString('base64')

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  })

  const data = await res.json().catch(() => ({}))
  const ok = res.ok && !data?.error_code
  return {
    ok,
    status: ok ? 'sent' : 'failed',
    messageId: data?.sid || null,
    response: data?.status || data?.message || `HTTP ${res.status}`,
    raw: data,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  const sendPassword = process.env.SMS_SEND_PASSWORD
  if (!sendPassword) {
    return res.status(500).json({
      ok: false,
      error: 'Server not configured: set SMS_SEND_PASSWORD (and gateway credentials) in Vercel.',
    })
  }

  // Vercel parses JSON bodies automatically; guard for string bodies too.
  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = {}
    }
  }
  const { to, message, password } = body || {}

  if (password !== sendPassword) {
    return res.status(401).json({ ok: false, error: 'Invalid SMS send password' })
  }

  if (rateLimited()) {
    return res.status(429).json({ ok: false, error: 'Rate limit exceeded — slow down' })
  }

  if (!isValidE164(to)) {
    return res.status(400).json({ ok: false, status: 'failed', error: 'Invalid recipient (E.164 required)' })
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ ok: false, status: 'failed', error: 'Message is required' })
  }

  const provider = (process.env.SMS_PROVIDER || 'africastalking').toLowerCase()

  try {
    const result =
      provider === 'twilio'
        ? await sendViaTwilio({ to, message })
        : await sendViaAfricasTalking({ to, message })

    return res.status(result.ok ? 200 : 502).json({
      ok: result.ok,
      provider,
      to,
      status: result.status,
      messageId: result.messageId || null,
      response: result.response,
    })
  } catch (err) {
    return res.status(502).json({
      ok: false,
      provider,
      to,
      status: 'failed',
      error: 'Gateway request failed',
      response: err?.message || String(err),
    })
  }
}
