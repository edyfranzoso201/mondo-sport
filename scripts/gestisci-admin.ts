/**
 * Gestione utenti Admin
 *
 * Lista admin:
 *   npx tsx scripts/gestisci-admin.ts lista
 *
 * Crea nuovo admin:
 *   npx tsx scripts/gestisci-admin.ts crea --alias=EdyAdmin --email=edy@email.it --password=Pass123! --nome=Edy --cognome=Franzoso --nascita=1974-03-10 --cf=FRNDYE74C10H355L --telefono=+393387161182 --comune=Grugliasco --regione=Piemonte --sport=calcio
 *
 * Aggiorna dati (e rigenera profilo pubblico):
 *   npx tsx scripts/gestisci-admin.ts aggiorna --email=edy.franzoso@gmail.com --nome=Edy --cognome=Franzoso --nascita=1974-03-10 --cf=FRNDYE74C10H355L --telefono=+393387161182 --comune=Grugliasco --regione=Piemonte --alias=EdyAdmin
 *
 * Sincronizza profilo pubblico (forza aggiornamento nel sito):
 *   npx tsx scripts/gestisci-admin.ts sincronizza --email=edy.franzoso@gmail.com
 *
 * Cambia password:
 *   npx tsx scripts/gestisci-admin.ts password --email=edy@email.it --password=NuovaPass456!
 *
 * Promuovi utente ad admin:
 *   npx tsx scripts/gestisci-admin.ts promuovi --email=utente@email.it
 *
 * Elimina utente:
 *   npx tsx scripts/gestisci-admin.ts elimina --email=utente@email.it
 */

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

function getArg(args: string[], name: string): string | null {
  const a = args.find(a => a.startsWith(`--${name}=`))
  return a ? a.split('=').slice(1).join('=') : null
}

async function main() {
  const { Redis } = await import('@upstash/redis')
  const bcrypt = await import('bcryptjs')
  const { v4: uuidv4 } = await import('uuid')

  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })

  const args = process.argv.slice(2)
  const comando = args[0]

  // ── LISTA ─────────────────────────────────────────────────────────────────
  if (comando === 'lista') {
    const ids = await redis.smembers('users:approved')
    let count = 0
    for (const id of ids) {
      const raw = await redis.get(`user:${id}`) as any
      const u = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (u?.tipo === 'admin') {
        console.log(`\n✅ Admin trovato:`)
        console.log(`  Alias:    ${u.alias}`)
        console.log(`  Email:    ${u.email}`)
        console.log(`  Nome:     ${u.nome} ${u.cognome}`)
        console.log(`  Nascita:  ${u.dataNascita}`)
        console.log(`  CF:       ${u.codiceFiscale}`)
        console.log(`  Tel:      ${u.telefono}`)
        console.log(`  Comune:   ${u.comune}, ${u.regione}`)
        console.log(`  ID:       ${u.id}`)
        count++
      }
    }
    if (count === 0) console.log('Nessun admin trovato')
    return
  }

  // ── SINCRONIZZA profilo pubblico ───────────────────────────────────────────
  if (comando === 'sincronizza') {
    const email = getArg(args, 'email')
    if (!email) { console.error('❌ --email obbligatorio'); process.exit(1) }

    const userId = await redis.get(`user:email:${email.toLowerCase()}`) as string
    if (!userId) { console.error(`❌ Nessun utente con email: ${email}`); process.exit(1) }

    const raw = await redis.get(`user:${userId}`) as any
    const u = typeof raw === 'string' ? JSON.parse(raw) : raw

    // Rigenera profilo pubblico da zero con tutti i dati aggiornati
    const profilo = {
      id: u.id,
      tipo: u.tipo,
      alias: u.alias,
      annoDiNascita: u.annoDiNascita || (u.dataNascita ? new Date(u.dataNascita).getFullYear() : 0),
      comune: u.comune,
      regione: u.regione,
      sport: u.sport,
      sportPrimario: u.sportPrimario || u.sport?.[0],
      ruoli: u.ruoli,
      categoria: u.categoria,
      statoAnnuncio: u.statoAnnuncio || 'nascosto',
      nascondiRuolo: u.nascondiRuolo || false,
      descrizione: u.descrizione || undefined,
      createdAt: u.createdAt,
    }

    await redis.set(`profile:${userId}`, JSON.stringify(profilo))
    console.log(`\n✅ Profilo pubblico sincronizzato per ${u.alias} (${email})`)
    console.log(`   Comune: ${u.comune}, ${u.regione}`)
    console.log(`   Anno nascita: ${profilo.annoDiNascita}`)
    return
  }

  // ── CREA ──────────────────────────────────────────────────────────────────
  if (comando === 'crea') {
    const email    = getArg(args, 'email')
    const password = getArg(args, 'password')
    const alias    = getArg(args, 'alias') || 'Admin'
    const nome     = getArg(args, 'nome') || 'Admin'
    const cognome  = getArg(args, 'cognome') || 'MondoSport'
    const nascita  = getArg(args, 'nascita') || ''
    const cf       = getArg(args, 'cf') || ''
    const telefono = getArg(args, 'telefono') || ''
    const comune   = getArg(args, 'comune') || 'Roma'
    const regione  = getArg(args, 'regione') || 'Lazio'
    const sport    = getArg(args, 'sport') || 'calcio'

    if (!email || !password) { console.error('❌ --email e --password obbligatori'); process.exit(1) }
    if (password.length < 8) { console.error('❌ Password minimo 8 caratteri'); process.exit(1) }

    const id = uuidv4()
    const now = new Date().toISOString()
    const passwordHash = await bcrypt.hash(password, 12)
    const annoDiNascita = nascita ? new Date(nascita).getFullYear() : 1980

    const admin: any = {
      id, tipo: 'admin', stato: 'approved',
      alias, email, passwordHash,
      nome, cognome, dataNascita: nascita,
      codiceFiscale: cf.toUpperCase(), telefono,
      annoDiNascita, comune, regione,
      sport: [sport], sportPrimario: sport,
      ruoli: ['Admin'], categoria: ['Senior'],
      statoAnnuncio: 'nascosto', mostraAliasInChat: true,
      nascondiRuolo: false, descrizione: '',
      notificheEmailChat: true,
      emailVerificato: true, telefonoVerificato: true,
      alertAttivi: [], createdAt: now, updatedAt: now,
    }

    const pipe = redis.pipeline()
    pipe.set(`user:${id}`, JSON.stringify(admin))
    pipe.set(`user:email:${email.toLowerCase()}`, id)
    pipe.set(`user:alias:${alias.toLowerCase()}`, id)
    pipe.sadd('users:approved', id)
    pipe.set(`profile:${id}`, JSON.stringify({
      id, tipo: 'admin', alias, annoDiNascita, comune, regione,
      sport: [sport], sportPrimario: sport,
      ruoli: ['Admin'], categoria: ['Senior'],
      statoAnnuncio: 'nascosto', nascondiRuolo: false, createdAt: now,
    }))
    await pipe.exec()

    console.log(`\n✅ Admin creato!\n`)
    console.log(`  Alias:    ${alias}`)
    console.log(`  Nome:     ${nome} ${cognome}`)
    console.log(`  Email:    ${email}`)
    console.log(`  Password: ${password}`)
    console.log(`  Nascita:  ${nascita}`)
    console.log(`  CF:       ${cf}`)
    console.log(`  Tel:      ${telefono}`)
    console.log(`  Comune:   ${comune}, ${regione}`)
    console.log(`  ID:       ${id}`)
    console.log(`\n⚠️  Cambia la password dopo il primo accesso!\n`)
    return
  }

  // ── AGGIORNA ──────────────────────────────────────────────────────────────
  if (comando === 'aggiorna') {
    const email = getArg(args, 'email')
    if (!email) { console.error('❌ --email obbligatorio'); process.exit(1) }

    const userId = await redis.get(`user:email:${email.toLowerCase()}`) as string
    if (!userId) { console.error(`❌ Nessun utente con email: ${email}`); process.exit(1) }

    const raw = await redis.get(`user:${userId}`) as any
    const u = typeof raw === 'string' ? JSON.parse(raw) : raw

    // Applica solo i parametri passati
    const updates: any = { updatedAt: new Date().toISOString() }
    const nome    = getArg(args, 'nome');    if (nome !== null)    updates.nome = nome
    const cognome = getArg(args, 'cognome'); if (cognome !== null) updates.cognome = cognome
    const nascita = getArg(args, 'nascita'); if (nascita !== null) {
      updates.dataNascita = nascita
      updates.annoDiNascita = new Date(nascita).getFullYear()
    }
    const cf      = getArg(args, 'cf');      if (cf !== null)      updates.codiceFiscale = cf.toUpperCase()
    const tel     = getArg(args, 'telefono'); if (tel !== null)    updates.telefono = tel
    const comune  = getArg(args, 'comune');  if (comune !== null)  updates.comune = comune
    const regione = getArg(args, 'regione'); if (regione !== null) updates.regione = regione
    const alias   = getArg(args, 'alias');   if (alias !== null)   updates.alias = alias
    const sport   = getArg(args, 'sport');   if (sport !== null) {
      updates.sport = [sport]
      updates.sportPrimario = sport
    }
    const nuovaEmail = getArg(args, 'nuova-email')
    if (nuovaEmail !== null) {
      // Controlla che la nuova email non sia già in uso
      const esistente = await redis.get(`user:email:${nuovaEmail.toLowerCase()}`)
      if (esistente && esistente !== userId) {
        console.error(`❌ L'email ${nuovaEmail} è già usata da un altro account`)
        process.exit(1)
      }
      updates.email = nuovaEmail.toLowerCase()
    }

    const updated = { ...u, ...updates }

    // Salva utente aggiornato
    await redis.set(`user:${userId}`, JSON.stringify(updated))

    // Aggiorna alias lookup se cambiato
    if (alias && alias !== u.alias) {
      await redis.del(`user:alias:${u.alias.toLowerCase()}`)
      await redis.set(`user:alias:${alias.toLowerCase()}`, userId)
    }

    // Aggiorna email lookup se cambiata
    if (nuovaEmail && nuovaEmail.toLowerCase() !== u.email.toLowerCase()) {
      await redis.del(`user:email:${u.email.toLowerCase()}`)
      await redis.set(`user:email:${nuovaEmail.toLowerCase()}`, userId)
      console.log(`   Email: ${u.email} → ${nuovaEmail}`)
    }

    // Rigenera profilo pubblico completo
    const profilo = {
      id: userId,
      tipo: updated.tipo,
      alias: updated.alias,
      annoDiNascita: updated.annoDiNascita,
      comune: updated.comune,
      regione: updated.regione,
      sport: updated.sport,
      sportPrimario: updated.sportPrimario,
      ruoli: updated.ruoli,
      categoria: updated.categoria,
      statoAnnuncio: updated.statoAnnuncio || 'nascosto',
      nascondiRuolo: updated.nascondiRuolo || false,
      descrizione: updated.descrizione || undefined,
      createdAt: updated.createdAt,
    }
    await redis.set(`profile:${userId}`, JSON.stringify(profilo))

    console.log(`\n✅ Dati aggiornati per ${updated.alias} (${email})`)
    console.log(`   Nome:    ${updated.nome} ${updated.cognome}`)
    console.log(`   Nascita: ${updated.dataNascita} (anno: ${updated.annoDiNascita})`)
    console.log(`   CF:      ${updated.codiceFiscale}`)
    console.log(`   Tel:     ${updated.telefono}`)
    console.log(`   Comune:  ${updated.comune}, ${updated.regione}`)
    console.log(`\n✅ Profilo pubblico rigenerato — ricarica il sito per vedere i dati aggiornati.\n`)
    return
  }

  // ── PASSWORD ──────────────────────────────────────────────────────────────
  if (comando === 'password') {
    const email    = getArg(args, 'email')
    const password = getArg(args, 'password')
    if (!email || !password) { console.error('❌ --email e --password obbligatori'); process.exit(1) }
    if (password.length < 8) { console.error('❌ Password minimo 8 caratteri'); process.exit(1) }
    const userId = await redis.get(`user:email:${email.toLowerCase()}`) as string
    if (!userId) { console.error(`❌ Nessun utente con email: ${email}`); process.exit(1) }
    const raw = await redis.get(`user:${userId}`) as any
    const u = typeof raw === 'string' ? JSON.parse(raw) : raw
    const passwordHash = await bcrypt.hash(password, 12)
    await redis.set(`user:${userId}`, JSON.stringify({ ...u, passwordHash, updatedAt: new Date().toISOString() }))
    console.log(`✅ Password aggiornata per ${u.alias} (${email})`)
    return
  }

  // ── PROMUOVI ──────────────────────────────────────────────────────────────
  if (comando === 'promuovi') {
    const email = getArg(args, 'email')
    if (!email) { console.error('❌ --email obbligatorio'); process.exit(1) }
    const userId = await redis.get(`user:email:${email.toLowerCase()}`) as string
    if (!userId) { console.error(`❌ Nessun utente con email: ${email}`); process.exit(1) }
    const raw = await redis.get(`user:${userId}`) as any
    const u = typeof raw === 'string' ? JSON.parse(raw) : raw
    await redis.set(`user:${userId}`, JSON.stringify({ ...u, tipo: 'admin', updatedAt: new Date().toISOString() }))
    console.log(`✅ ${u.alias} promosso ad admin!`)
    return
  }

  // ── ELIMINA ───────────────────────────────────────────────────────────────
  if (comando === 'elimina') {
    const email = getArg(args, 'email')
    if (!email) { console.error('❌ --email obbligatorio'); process.exit(1) }
    const userId = await redis.get(`user:email:${email.toLowerCase()}`) as string
    if (!userId) { console.error(`❌ Nessun utente con email: ${email}`); process.exit(1) }
    const raw = await redis.get(`user:${userId}`) as any
    const u = typeof raw === 'string' ? JSON.parse(raw) : raw
    const pipe = redis.pipeline()
    pipe.srem('users:approved', userId)
    pipe.srem('users:pending', userId)
    pipe.del(`user:${userId}`)
    pipe.del(`profile:${userId}`)
    pipe.del(`user:email:${email.toLowerCase()}`)
    pipe.del(`user:alias:${u.alias.toLowerCase()}`)
    await pipe.exec()
    console.log(`✅ Utente ${u.alias} (${email}) eliminato`)
    return
  }

  // ── HELP ──────────────────────────────────────────────────────────────────
  console.log(`
Uso: npx tsx scripts/gestisci-admin.ts <comando> [opzioni]

Comandi:
  lista                          Lista tutti gli admin con dati completi
  sincronizza --email=X          Forza aggiornamento profilo nel sito
  crea        --alias=X --email=X --password=X --nome=X --cognome=X
              --nascita=YYYY-MM-DD --cf=X --telefono=X --comune=X --regione=X
  aggiorna    --email=X [--nuova-email=X] [--alias=X] [--nome=X] [--cognome=X] [--nascita=X]
              [--cf=X] [--telefono=X] [--comune=X] [--regione=X]
  password    --email=X --password=X
  promuovi    --email=X
  elimina     --email=X
  `)
}

main().catch(console.error)
