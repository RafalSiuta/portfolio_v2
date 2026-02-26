import 'dotenv/config'
import http from 'node:http'
import { sendContactMail } from './mailer.js'

const PORT = process.env.MAIL_DEV_PORT || 3001
const ALLOW_ORIGIN = process.env.MAIL_DEV_ORIGIN || 'http://localhost:5173'
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOW_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(data))
}

const server = http.createServer(async (req, res) => {
  // Preflight (CORS)
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': ALLOW_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    return res.end()
  }

  if (req.method !== 'POST' || req.url !== '/api/contact') {
    return sendJson(res, 404, { ok: false, error: 'Not found' })
  }

  try {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', async () => {
      let data
      try {
        data = JSON.parse(body || '{}')
      } catch {
        return sendJson(res, 400, { ok: false, error: 'Invalid JSON' })
      }

      const email = String(data.email || '').trim()
      const topic = String(data.topic || '').trim()
      const message = String(data.message || '').trim()

      if (!email || !topic || !message) {
        return sendJson(res, 400, { ok: false, error: 'Missing fields' })
      }
      if (!emailPattern.test(email)) {
        return sendJson(res, 400, { ok: false, error: 'Invalid email' })
      }

      await sendContactMail({ email, subject: topic, message })
      return sendJson(res, 200, { ok: true })
    })
  } catch (err) {
    console.error(err)
    return sendJson(res, 500, { ok: false, error: 'Server error' })
  }
})

server.listen(PORT, () => {
  console.log(`Mail dev server: http://localhost:${PORT}/api/contact`)
  console.log(`CORS allow origin: ${ALLOW_ORIGIN}`)
})