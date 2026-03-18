import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function inviaEmailVerifica(email: string, alias: string, token: string): Promise<void> {
  const url = `${process.env.NEXTAUTH_URL}/verifica-email?token=${token}`
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Mondo Sport — Verifica il tuo indirizzo email',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px">
        <h1 style="color:#1a6b3a;font-size:24px;margin-bottom:8px">Mondo Sport</h1>
        <p>Ciao <strong>${alias}</strong>,</p>
        <p>Grazie per esserti registrato. Clicca il pulsante qui sotto per verificare la tua email:</p>
        <a href="${url}" style="display:inline-block;background:#1a6b3a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">
          Verifica Email
        </a>
        <p style="color:#666;font-size:13px">Oppure copia e incolla questo link: <br>${url}</p>
        <p style="color:#666;font-size:13px">Il link scade tra 24 ore. Dopo la verifica dell'email, il tuo account sarà revisionato dall'amministratore.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#999;font-size:12px">Mondo Sport — La piattaforma per atleti e società sportive</p>
      </div>
    `,
  })
}

export async function inviaEmailApprovazioneAdmin(
  adminEmail: string,
  utente: { alias: string; email: string; tipo: string; id: string }
): Promise<void> {
  const url = `${process.env.NEXTAUTH_URL}/admin/utenti`
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: adminEmail,
    subject: `Mondo Sport — Nuova registrazione da approvare: ${utente.alias}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px">
        <h1 style="color:#1a6b3a">Nuova registrazione</h1>
        <p>Un nuovo utente si è registrato e attende approvazione:</p>
        <ul>
          <li><strong>Alias:</strong> ${utente.alias}</li>
          <li><strong>Email:</strong> ${utente.email}</li>
          <li><strong>Tipo:</strong> ${utente.tipo}</li>
        </ul>
        <a href="${url}" style="display:inline-block;background:#1a6b3a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">
          Vai al pannello admin
        </a>
      </div>
    `,
  })
}

export async function inviaEmailConfermaApprovazione(email: string, alias: string): Promise<void> {
  const url = `${process.env.NEXTAUTH_URL}/accedi`
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Mondo Sport — Il tuo account è stato approvato!',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px">
        <h1 style="color:#1a6b3a">Benvenuto su Mondo Sport!</h1>
        <p>Ciao <strong>${alias}</strong>,</p>
        <p>Il tuo account è stato approvato. Puoi ora accedere e contattare altri atleti e società.</p>
        <a href="${url}" style="display:inline-block;background:#1a6b3a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">
          Accedi ora
        </a>
      </div>
    `,
  })
}

export async function inviaAlertEmail(
  email: string,
  alias: string,
  profilo: { alias: string; sport: string; ruoli: string[]; comune: string }
): Promise<void> {
  const url = `${process.env.NEXTAUTH_URL}/annunci`
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Mondo Sport — Nuovo annuncio che potrebbe interessarti`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px">
        <h1 style="color:#1a6b3a">Nuovo annuncio!</h1>
        <p>Ciao <strong>${alias}</strong>, c'è un nuovo annuncio che corrisponde ai tuoi criteri:</p>
        <div style="border:1px solid #eee;border-radius:8px;padding:16px;margin:16px 0">
          <p><strong>Alias:</strong> ${profilo.alias}</p>
          <p><strong>Sport:</strong> ${profilo.sport}</p>
          <p><strong>Ruolo:</strong> ${profilo.ruoli.join(', ')}</p>
          <p><strong>Comune:</strong> ${profilo.comune}</p>
        </div>
        <a href="${url}" style="display:inline-block;background:#1a6b3a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">
          Vedi annuncio
        </a>
      </div>
    `,
  })
}

export async function inviaEmailNuovoMessaggio(
  email: string,
  destinatario: string,
  mittente: string,
  anteprima: string
): Promise<void> {
  const url = `${process.env.NEXTAUTH_URL}/chat`
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Mondo Sport — Nuovo messaggio da ${mittente}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px">
        <h1 style="color:#4a7c8e;font-size:22px;margin-bottom:4px">Nuovo messaggio</h1>
        <p>Ciao <strong>${destinatario}</strong>,</p>
        <p><strong>${mittente}</strong> ti ha inviato un messaggio su Mondo Sport:</p>
        <div style="background:#f0f7fa;border-left:4px solid #4a7c8e;padding:12px 16px;margin:16px 0;border-radius:0 8px 8px 0;font-style:italic;color:#374151">
          "${anteprima.slice(0, 120)}${anteprima.length > 120 ? '...' : ''}"
        </div>
        <a href="${url}" style="display:inline-block;background:#4a7c8e;color:white;padding:11px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Rispondi nella chat
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:20px">
          Per disattivare queste notifiche, vai su Profilo → Visibilità → Notifiche email.
        </p>
      </div>
    `,
  })
}
