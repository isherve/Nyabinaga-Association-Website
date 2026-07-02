# SMS Center — Setup Guide

The site now has an **SMS Center** at `/admin/sms` (admin sign-in required) that sends
real text messages to mobile phones, one SMS per recipient. It supports Rwanda
numbers (`0781011343` and `+250781011343`), auto-converts local numbers to `+250`,
validates them, imports/exports contacts (Excel/CSV), and keeps a send history.

**Nothing sends until you complete the steps below.** SMS costs money and needs a
gateway account with a funded balance. The gateway API keys live only on the server
(Vercel environment variables) and are never shipped to the browser.

> The SMS Center only works on the **Vercel** deployment (it needs the serverless
> backend in `/api`). It will not work on GitHub Pages, which has no backend.

---

## 1. Create a gateway account

Pick one provider. **Africa's Talking** is recommended for Rwanda.

### Option A — Africa's Talking (recommended)
1. Sign up at <https://africastalking.com> and verify your account.
2. Create an app and copy its **API key** and **username**.
3. Start in the **sandbox** to test for free, then switch to **production** and buy
   an SMS bundle / register a Sender ID for live delivery.

### Option B — Twilio
1. Sign up at <https://twilio.com>, get a phone number with SMS capability.
2. Copy your **Account SID**, **Auth Token**, and the **From** number (E.164).

---

## 2. Add environment variables in Vercel

Vercel → your project → **Settings → Environment Variables**. Add these, then
redeploy.

**Always required**

| Variable | Value |
| --- | --- |
| `SMS_SEND_PASSWORD` | A secret you choose. The admin types it in the send dialog. Without it, the endpoint refuses to send. |
| `SMS_PROVIDER` | `africastalking` (default) or `twilio` |

**Africa's Talking**

| Variable | Value |
| --- | --- |
| `AT_API_KEY` | Your API key |
| `AT_USERNAME` | Your username (`sandbox` for testing) |
| `AT_ENV` | `sandbox` or `production` |
| `AT_SENDER_ID` | (optional) registered sender ID / short code |

**Twilio**

| Variable | Value |
| --- | --- |
| `TWILIO_ACCOUNT_SID` | Account SID |
| `TWILIO_AUTH_TOKEN` | Auth token |
| `TWILIO_FROM` | Your Twilio number, e.g. `+15125551234` |

---

## 3. (Optional) Delivery reports

To receive delivered/failed callbacks, register this URL in your gateway dashboard
as the delivery-report / status-callback URL:

```
https://<your-domain>/api/sms/status
```

The endpoint (`api/sms/status.js`) currently logs callbacks. To show delivery
status across devices, connect it to a database (see "Going further" below).

---

## 4. Use it

1. Deploy to Vercel and open `https://<your-domain>/admin/sms`.
2. Sign in as admin (top-right lock icon).
3. Add contacts, or **Import file** (Excel/CSV with `Full Name` and `Phone Number`).
4. Select recipients, write the message, click **Send SMS**.
5. Confirm, enter your `SMS_SEND_PASSWORD`, and watch the progress.

---

## Local testing

`npm run dev` (Vite) does **not** run the `/api` functions. To test the backend
locally use the Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

…with the same environment variables in a local `.env` (or `vercel env pull`).

---

## Going further (shared, persistent data)

v1 stores contacts and history in the admin's browser (localStorage). For shared,
multi-device data and live delivery updates, add a database (e.g. Supabase):

- Store `contacts` and `sms_logs` tables.
- Replace the functions in `src/lib/smsStore.js` with API calls.
- Have `api/sms/status.js` update `sms_logs` by `message_id` on each callback.

The UI does not need to change.
