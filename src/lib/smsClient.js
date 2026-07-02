// Thin client for the SMS backend (Vercel serverless function).

/**
 * Send a single SMS. Resolves with a normalized result and never throws for
 * gateway/HTTP errors (so a bulk loop can continue to the next recipient).
 * @returns {Promise<{ ok: boolean, status: 'sent'|'failed', response: string, messageId?: string }>}
 */
export async function sendSms({ to, message, password }) {
  try {
    const res = await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ to, message, password }),
    })

    let data = {}
    try {
      data = await res.json()
    } catch {
      /* non-JSON response */
    }

    return {
      ok: !!data.ok,
      code: res.status,
      status: data.status || (data.ok ? 'sent' : 'failed'),
      response: data.response || data.error || `HTTP ${res.status}`,
      messageId: data.messageId || null,
    }
  } catch (err) {
    // Network failure (e.g. running on a host without the backend).
    return {
      ok: false,
      code: 0,
      status: 'failed',
      response: err?.message || 'Network error — backend unreachable',
      messageId: null,
    }
  }
}
