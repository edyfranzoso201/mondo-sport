import nodemailer from 'nodemailer'

function getTransporter() {
  // Se non ci sono variabili SMTP, usa un log silenzioso
  if (!process.env.SMTP_HOST && !process.env.SMTP_USER) {
    return null
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465 || !process.env.SMTP_PORT,
    tls: { rejectUnauthorized: false },
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function inviaEmailVerifica(email: string, alias: string, token: string) {
  const transporter = getTransporter()
  if (!transporter) { console.log(`[EMAIL] Verifica per ${alias} - token: ${token}`); return }
  const url = `${process.env.NEXTAUTH_URL}/verifica-email?token=${token}`
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Verifica il tuo account Mondo Sport',
    html: `<p>Ciao <strong>${alias}</strong>,</p><p>Clicca per verificare: <a href="${url}">${url}</a></p>`,
  }).catch(e => console.error('[EMAIL] Errore verifica:', e.message))
}

export async function inviaEmailApprovazioneAdmin(adminEmail: string, utente: any) {
  const transporter = getTransporter()
  if (!transporter) {
    console.log(`[EMAIL] Nuovo utente in attesa: ${utente.alias} (${utente.email})`)
    return
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: adminEmail,
    subject: `🏅 Mondo Sport — Nuovo utente: ${utente.alias}`,
    html: `
      <h2>Nuovo utente in attesa di approvazione</h2>
      <table style="border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Alias:</td><td>${utente.alias}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Email:</td><td>${utente.email}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Tipo:</td><td>${utente.tipo}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Sport:</td><td>${utente.sport?.join(', ')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Comune:</td><td>${utente.comune}, ${utente.regione}</td></tr>
      </table>
      <p><a href="${process.env.NEXTAUTH_URL}/admin" style="background:#4a7c8e;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px">
        Vai al pannello admin
      </a></p>
    `,
  }).catch(e => console.error('[EMAIL] Errore notifica admin:', e.message))
}

export async function inviaEmailApprovazione(email: string, alias: string) {
  const transporter = getTransporter()
  if (!transporter) { console.log(`[EMAIL] Approvato: ${alias}`); return }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: '✅ Account approvato — Mondo Sport',
    html: `<p>Ciao <strong>${alias}</strong>, il tuo account è stato approvato!</p><p><a href="${process.env.NEXTAUTH_URL}">Accedi ora</a></p>`,
  }).catch(e => console.error('[EMAIL] Errore approvazione:', e.message))
}

export async function inviaNotificaChat(email: string, alias: string, mittente: string) {
  const transporter = getTransporter()
  if (!transporter) { console.log(`[EMAIL] Chat a ${alias} da ${mittente}`); return }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: `💬 Nuovo messaggio da ${mittente} — Mondo Sport`,
    html: `<p>Ciao <strong>${alias}</strong>, hai un nuovo messaggio da <strong>${mittente}</strong>.</p><p><a href="${process.env.NEXTAUTH_URL}/chat">Vai alla chat</a></p>`,
  }).catch(e => console.error('[EMAIL] Errore chat:', e.message))
}

// Alias per compatibilità
export const inviaAlertEmail = inviaNotificaChat
export const inviaEmailNuovoMessaggio = inviaNotificaChat
export const inviaEmailConfermaApprovazione = inviaEmailApprovazione
