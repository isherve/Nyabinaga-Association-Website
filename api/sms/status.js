// Vercel serverless function: receive delivery-status callbacks from the gateway.
//
// Register this URL as your Delivery Report / Status Callback in the gateway
// dashboard (e.g. Africa's Talking → SMS → Delivery Reports):
//   https://<your-domain>/api/sms/status
//
// Africa's Talking posts: id, status (Success/Failed/...), phoneNumber, ...
// Twilio posts:           MessageSid, MessageStatus (delivered/failed/...), To, ...
//
// v1 simply acknowledges and logs the callback. Persisting these updates so the
// admin UI can show "Delivered/Failed" across devices requires a database — wire
// this handler to your DB (e.g. update the sms_logs row by messageId) when ready.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false })
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = {}
    }
  }

  const messageId = body?.id || body?.MessageSid || null
  const status = body?.status || body?.MessageStatus || null
  const phone = body?.phoneNumber || body?.To || null

  // Log for observability (visible in Vercel function logs).
  console.log('[sms:delivery]', JSON.stringify({ messageId, status, phone }))

  // TODO: persist to DB — e.g. update sms_logs SET status = ? WHERE message_id = ?

  return res.status(200).json({ ok: true })
}
