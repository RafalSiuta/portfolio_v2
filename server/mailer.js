import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendContactMail({ email, subject, message }) {
  const plain = [
    'PORTFOLIO',
    `Od: ${email}`,
    `Temat: ${subject}`,
    '',
    message,
  ].join('\n')

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>PORTFOLIO</h2>
      <p><b>Od:</b> ${escapeHtml(email)}</p>
      <p><b>Temat:</b> ${escapeHtml(subject)}</p>
      <hr/>
      <pre style="white-space:pre-wrap">${escapeHtml(message)}</pre>
    </div>
  `

  return transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.GMAIL_USER,
    to: process.env.MAIL_TO || process.env.GMAIL_USER,
    subject: `[PORTFOLIO] ${subject}`,
    text: plain,
    html,
    replyTo: email,
    headers: { 'X-Contact-Source': 'portfolio-web-local' },
  })
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}