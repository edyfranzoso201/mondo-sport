import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { creaUtente, getUtenteByEmail, aliasDisponibile, salvaToken } from '@/lib/db'
import { inviaEmailVerifica, inviaEmailApprovazioneAdmin } from '@/lib/email'
import type { UtenteAtleta, UtenteSocieta, UtenteStaff } from '@/types'

const cfRegex = /^[A-Z0-9]{16}$/i  // lunghezza 16 alfanumerico

const schemaAtleta = z.object({
  tipo: z.literal('atleta'),
  alias: z.string().min(3, 'Alias min 3 caratteri').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Solo lettere, numeri e _'),
  email: z.string().email('Email non valida'),
  password: z.string().min(8, 'Password min 8 caratteri'),
  nome: z.string().min(2, 'Nome obbligatorio'),
  cognome: z.string().min(2, 'Cognome obbligatorio'),
  dataNascita: z.string().min(1, 'Data di nascita obbligatoria'),
  codiceFiscale: z.string().regex(cfRegex, 'Codice fiscale non valido (16 caratteri)'),
  telefono: z.string().min(9, 'Telefono non valido'),
  comune: z.string().min(2, 'Comune obbligatorio'),
  regione: z.string().min(2, 'Regione obbligatoria'),
  sport: z.array(z.enum(['calcio', 'pallavolo', 'basket', 'calcio5', 'padel', 'softair'])).min(1, 'Seleziona almeno uno sport'),
  sportPrimario: z.enum(['calcio', 'pallavolo', 'basket', 'calcio5', 'padel', 'softair'], { errorMap: () => ({ message: 'Sport primario obbligatorio' }) }),
  ruoli: z.array(z.string()).min(1, 'Seleziona almeno un ruolo'),
  categoria: z.array(z.string()).min(1, 'Seleziona almeno una categoria'),
  privacyAccettata: z.literal(true, { errorMap: () => ({ message: 'Devi accettare la privacy' }) }),
  genitore: z.object({
    nome: z.string().min(2),
    cognome: z.string().min(2),
    dataNascita: z.string().min(1),
    codiceFiscale: z.string().regex(cfRegex),
    email: z.string().email(),
    telefono: z.string().min(9),
  }).optional(),
})

const schemaSocieta = z.object({
  tipo: z.literal('societa'),
  alias: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  nomeSocieta: z.string().min(2, 'Nome società obbligatorio'),
  email: z.string().email(),
  password: z.string().min(8),
  nome: z.string().min(2),
  cognome: z.string().min(2),
  dataNascita: z.string().min(1),
  codiceFiscale: z.string().regex(cfRegex, 'Codice fiscale non valido'),
  telefono: z.string().min(9),
  ruoloSocietario: z.string().min(2, 'Ruolo societario obbligatorio'),
  comune: z.string().min(2),
  regione: z.string().min(2),
  sport: z.array(z.enum(['calcio', 'pallavolo', 'basket', 'calcio5', 'padel', 'softair'])).min(1),
  sportPrimario: z.enum(['calcio', 'pallavolo', 'basket', 'calcio5', 'padel', 'softair']),
  ruoli: z.array(z.string()).default([]),
  categoria: z.array(z.string()).default([]),
  mostraNomeSocieta: z.boolean().default(false),
  privacyAccettata: z.literal(true, { errorMap: () => ({ message: 'Devi accettare la privacy' }) }),
})

const schemaStaff = z.object({
  tipo: z.literal('staff'),
  alias: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  nome: z.string().min(2),
  cognome: z.string().min(2),
  dataNascita: z.string().min(1),
  codiceFiscale: z.string().regex(cfRegex, 'Codice fiscale non valido'),
  telefono: z.string().min(9),
  comune: z.string().min(2),
  regione: z.string().min(2),
  sport: z.array(z.enum(['calcio', 'pallavolo', 'basket'])).min(1),
  sportPrimario: z.enum(['calcio', 'pallavolo', 'basket']),
  ruoli: z.array(z.string()).min(1),
  categoria: z.array(z.string()).min(1),
  qualifiche: z.array(z.string()).default([]),
  liberoProf: z.boolean().default(false),
  privacyAccettata: z.literal(true, { errorMap: () => ({ message: 'Devi accettare la privacy' }) }),
})

function calcAnno(d: string) { return new Date(d).getFullYear() }

function isMinorenne(d: string) {
  const oggi = new Date(), nascita = new Date(d)
  let eta = oggi.getFullYear() - nascita.getFullYear()
  const m = oggi.getMonth() - nascita.getMonth()
  if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) eta--
  return eta < 18
}

// In sviluppo senza SMTP configurato, email è auto-verificata
const smtpConfigurato = !!(process.env.SMTP_USER && process.env.SMTP_PASS &&
  process.env.SMTP_USER !== '' && process.env.SMTP_PASS !== '' &&
  !process.env.SMTP_USER.includes('tua@'))

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const esistente = await getUtenteByEmail(body.email)
    if (esistente) return NextResponse.json({ error: 'Email già registrata' }, { status: 400 })

    const aliasLibero = await aliasDisponibile(body.alias)
    if (!aliasLibero) return NextResponse.json({ error: 'Alias non disponibile, scegline un altro' }, { status: 400 })

    const passwordHash = await bcrypt.hash(body.password, 12)
    const id = uuidv4()
    const now = new Date().toISOString()

    // Se SMTP non configurato, l'email è già verificata (modalità sviluppo)
    const emailVerificato = !smtpConfigurato

    let utente: UtenteAtleta | UtenteSocieta | UtenteStaff

    if (body.tipo === 'atleta') {
      const parsed = schemaAtleta.safeParse(body)
      if (!parsed.success) {
        const campi = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(' | ')
        return NextResponse.json({ error: `Campi non validi: ${campi}` }, { status: 400 })
      }
      const data = parsed.data
      if (isMinorenne(data.dataNascita) && !data.genitore) {
        return NextResponse.json({ error: 'Dati del genitore richiesti per minorenni' }, { status: 400 })
      }
      utente = {
        id, tipo: 'atleta', stato: 'pending',
        alias: data.alias, email: data.email, passwordHash,
        nome: data.nome, cognome: data.cognome,
        dataNascita: data.dataNascita,
        codiceFiscale: data.codiceFiscale.toUpperCase(),
        telefono: data.telefono,
        annoDiNascita: calcAnno(data.dataNascita),
        comune: data.comune, regione: data.regione,
        sport: data.sport, sportPrimario: data.sportPrimario,
        ruoli: data.ruoli, categoria: data.categoria,
        statoAnnuncio: 'cerca', mostraAliasInChat: true,
        emailVerificato, telefonoVerificato: false, nascondiRuolo: false, notificheEmailChat: true,
        alertAttivi: [], createdAt: now, updatedAt: now,
        minorenne: isMinorenne(data.dataNascita),
        genitore: data.genitore,
      } as UtenteAtleta

    } else if (body.tipo === 'societa') {
      const parsed = schemaSocieta.safeParse(body)
      if (!parsed.success) {
        const campi = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(' | ')
        return NextResponse.json({ error: `Campi non validi: ${campi}` }, { status: 400 })
      }
      const data = parsed.data
      utente = {
        id, tipo: 'societa', stato: 'pending',
        alias: data.alias, email: data.email, passwordHash,
        nome: data.nome, cognome: data.cognome,
        dataNascita: data.dataNascita,
        codiceFiscale: data.codiceFiscale.toUpperCase(),
        telefono: data.telefono,
        annoDiNascita: calcAnno(data.dataNascita),
        comune: data.comune, regione: data.regione,
        sport: data.sport, sportPrimario: data.sportPrimario,
        ruoli: data.ruoli, categoria: data.categoria,
        statoAnnuncio: 'disponibile', mostraAliasInChat: true,
        emailVerificato, telefonoVerificato: false, nascondiRuolo: false, notificheEmailChat: true,
        alertAttivi: [], createdAt: now, updatedAt: now,
        nomeSocieta: data.nomeSocieta,
        ruoloSocietario: data.ruoloSocietario,
        mostraNomeSocieta: data.mostraNomeSocieta,
      } as UtenteSocieta

    } else if (body.tipo === 'staff') {
      const parsed = schemaStaff.safeParse(body)
      if (!parsed.success) {
        const campi = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(' | ')
        return NextResponse.json({ error: `Campi non validi: ${campi}` }, { status: 400 })
      }
      const data = parsed.data
      utente = {
        id, tipo: 'staff', stato: 'pending',
        alias: data.alias, email: data.email, passwordHash,
        nome: data.nome, cognome: data.cognome,
        dataNascita: data.dataNascita,
        codiceFiscale: data.codiceFiscale.toUpperCase(),
        telefono: data.telefono,
        annoDiNascita: calcAnno(data.dataNascita),
        comune: data.comune, regione: data.regione,
        sport: data.sport, sportPrimario: data.sportPrimario,
        ruoli: data.ruoli, categoria: data.categoria,
        statoAnnuncio: 'disponibile', mostraAliasInChat: true,
        emailVerificato, telefonoVerificato: false, nascondiRuolo: false, notificheEmailChat: true,
        alertAttivi: [], createdAt: now, updatedAt: now,
        qualifiche: data.qualifiche,
        liberoProf: data.liberoProf,
      } as UtenteStaff

    } else {
      return NextResponse.json({ error: 'Tipo utente non valido' }, { status: 400 })
    }

    await creaUtente(utente)
    console.log(`✅ Utente creato: ${utente.alias} (${utente.tipo}) | emailVerificato: ${emailVerificato} | SMTP: ${smtpConfigurato}`)

    // Email verifica (solo se SMTP configurato)
    if (smtpConfigurato) {
      const token = uuidv4()
      await salvaToken(token, id)
      try {
        await inviaEmailVerifica(utente.email, utente.alias, token)
        console.log(`📧 Email verifica inviata a ${utente.email}`)
      } catch (e) {
        console.warn('Email verifica fallita:', (e as Error).message)
      }
      try {
        await inviaEmailApprovazioneAdmin(process.env.ADMIN_EMAIL!, {
          alias: utente.alias, email: utente.email, tipo: utente.tipo, id,
        })
      } catch (e) {
        console.warn('Email admin fallita:', (e as Error).message)
      }
    } else {
      console.log(`⚠️  SMTP non configurato — email non inviate. L'utente è visibile in /admin per l'approvazione.`)
    }

    return NextResponse.json({
      success: true,
      message: smtpConfigurato
        ? "Registrazione completata! Controlla la tua email per verificare l'account."
        : "Registrazione completata! L'amministratore riceverà la richiesta e approverà il tuo account.",
      smtpConfigurato,
    })

  } catch (err: any) {
    console.error('Errore registrazione:', err)
    return NextResponse.json({ error: 'Errore interno: ' + err.message }, { status: 500 })
  }
}
