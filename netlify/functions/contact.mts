import nodemailer from 'nodemailer'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const maxFieldLength = {
  email: 254,
  topic: 160,
  message: 5000,
}

function getEnv(name: string) {
  return globalThis.Netlify?.env.get(name) ?? process.env[name]
}

function jsonResponse(status: number, data: Record<string, unknown>) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function validateContactPayload(data: Record<string, unknown>) {
  const email = String(data.email ?? '').trim()
  const topic = String(data.topic ?? '').trim()
  const message = String(data.message ?? '').trim()

  if (!email || !topic || !message) {
    return { error: 'Missing fields' }
  }

  if (
    email.length > maxFieldLength.email
    || topic.length > maxFieldLength.topic
    || message.length > maxFieldLength.message
  ) {
    return { error: 'Message is too long' }
  }

  if (!emailPattern.test(email)) {
    return { error: 'Invalid email' }
  }

  return { email, topic, message }
}

async function sendContactMail({ email, topic, message }: { email: string; topic: string; message: string }) {
  const gmailUser = getEnv('GMAIL_USER')
  const gmailAppPassword = getEnv('GMAIL_APP_PASSWORD')
  const mailFrom = getEnv('MAIL_FROM') || gmailUser
  const mailTo = getEnv('MAIL_TO') || gmailUser

  if (!gmailUser || !gmailAppPassword || !mailFrom || !mailTo) {
    throw new Error('Mail environment variables are not configured')
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  })

  const plain = [
    'PORTFOLIO',
    `From: ${email}`,
    `Topic: ${topic}`,
    '',
    message,
  ].join('\n')

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>PORTFOLIO</h2>
      <p><b>From:</b> ${escapeHtml(email)}</p>
      <p><b>Topic:</b> ${escapeHtml(topic)}</p>
      <hr/>
      <pre style="white-space:pre-wrap">${escapeHtml(message)}</pre>
    </div>
  `

  return transporter.sendMail({
    from: mailFrom,
    to: mailTo,
    subject: `[PORTFOLIO] ${topic}`,
    text: plain,
    html,
    replyTo: email,
    headers: { 'X-Contact-Source': 'portfolio-web-netlify' },
  })
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'Method not allowed' })
  }

  let data: Record<string, unknown>

  try {
    data = await req.json()
  } catch {
    return jsonResponse(400, { ok: false, error: 'Invalid JSON' })
  }

  const payload = validateContactPayload(data)

  if ('error' in payload) {
    return jsonResponse(400, { ok: false, error: payload.error })
  }

  try {
    await sendContactMail(payload)
    return jsonResponse(200, { ok: true })
  } catch (error) {
    console.error(error)
    return jsonResponse(500, { ok: false, error: 'Server error' })
  }
}

export const config = {
  path: '/api/contact',
  method: ['POST'],
}
