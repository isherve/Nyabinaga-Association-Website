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
//   SMS_PROVIDER        "africastalking" (default), "twilio", or "mtn".
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
//
//   For MTN API Marketplace / MADAPI (developers.mtn.com):
//     MTN_CONSUMER_KEY      Consumer Key (client id) from your approved app.
//     MTN_CONSUMER_SECRET   Consumer Secret.
//     MTN_SUBSCRIPTION_KEY  Ocp-Apim-Subscription-Key for the SMS product.
//     MTN_TOKEN_URL         OAuth2 token endpoint from the docs (client_credentials).
//     MTN_SMS_URL           SMS "send" endpoint URL from the SMS product docs.
//     MTN_SENDER_ID         Your assigned sender ID / short code (the "from").
//     All URLs must be copied exactly from YOUR app's documentation, because MTN
//     assigns different hosts/versions per environment.

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

// MTN API Marketplace (MADAPI) — SMS v3 for Rwanda.
// Docs: https://developers.mtn.com/products/sms-v3-api
async function mtnGetToken(key, secret, tokenUrl) {
  const body = new URLSearchParams({ client_id: key, client_secret: secret })
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  })
  const data = await res.json().catch(() => ({}))
  return { res, data, token: data?.access_token || data?.accessToken || null }
}

async function sendViaMtn({ to, message }) {
  const key = process.env.MTN_CONSUMER_KEY
  const secret = process.env.MTN_CONSUMER_SECRET
  // Optional: MADAPI SMS v3 authenticates with the bearer token alone, but some
  // gateway configs also expect an APIM subscription key — sent only if present.
  const subKey = process.env.MTN_SUBSCRIPTION_KEY
  const smsUrl = process.env.MTN_SMS_URL || 'https://api.mtn.com/v3/sms/messages/sms/outbound'
  const senderId = process.env.MTN_SENDER_ID

  const missing = []
  if (!key) missing.push('MTN_CONSUMER_KEY')
  if (!secret) missing.push('MTN_CONSUMER_SECRET')
  if (missing.length) {
    return { ok: false, status: 'failed', response: `MTN not configured: ${missing.join(', ')}` }
  }

  // 1) OAuth token. The portal documents two token-URL variants; try the
  // configured one first (if any), then the known fallbacks.
  const tokenUrls = [
    process.env.MTN_TOKEN_URL,
    'https://api.mtn.com/v1/oauth/access_token?grant_type=client_credentials',
    'https://api.mtn.com/v1/oauth/access_token/accesstoken?grant_type=client_credentials',
  ].filter(Boolean)

  let accessToken = null
  let lastAuthMsg = 'unknown error'
  for (const url of tokenUrls) {
    // eslint-disable-next-line no-await-in-loop
    const { res, data, token } = await mtnGetToken(key, secret, url)
    if (res.ok && token) {
      accessToken = token
      break
    }
    lastAuthMsg = data?.error_description || data?.message || data?.fault?.faultstring || `HTTP ${res.status}`
  }

  if (!accessToken) {
    return { ok: false, status: 'failed', response: `MTN auth failed: ${lastAuthMsg}` }
  }

  // 2) Send SMS (one recipient per request).
  const smsHeaders = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (subKey) smsHeaders['Ocp-Apim-Subscription-Key'] = subKey

  const payload = {
    receiverAddress: [to],
    message,
    clientCorrelatorId: `nyabinaga-${Date.now()}`,
    requestDeliveryReceipt: false,
  }
  // The SMS v3 schema requires a serviceCode (short code) unless a senderAddress
  // is used; include whichever your MTN account was provisioned with.
  if (process.env.MTN_SERVICE_CODE) payload.serviceCode = process.env.MTN_SERVICE_CODE
  if (senderId) payload.senderAddress = senderId

  const smsRes = await fetch(smsUrl, {
    method: 'POST',
    headers: smsHeaders,
    body: JSON.stringify(payload),
  })
  const smsData = await smsRes.json().catch(() => ({}))
  const ok = smsRes.ok

  return {
    ok,
    status: ok ? 'sent' : 'failed',
    messageId:
      smsData?.data?.transactionId ||
      smsData?.transactionId ||
      smsData?.messageId ||
      smsData?.id ||
      null,
    response:
      smsData?.statusMessage ||
      smsData?.message ||
      smsData?.description ||
      smsData?.supportMessage ||
      (ok ? 'Success' : `HTTP ${smsRes.status}`),
    raw: smsData,
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
    let result
    if (provider === 'twilio') result = await sendViaTwilio({ to, message })
    else if (provider === 'mtn') result = await sendViaMtn({ to, message })
    else result = await sendViaAfricasTalking({ to, message })

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
