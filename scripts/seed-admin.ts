/**
 * Script per creare il primo utente amministratore.
 * Eseguire con: npx ts-node --project tsconfig.json scripts/seed-admin.ts
 * oppure: npx tsx scripts/seed-admin.ts
 *
 * Richiede le variabili d'ambiente in .env.local
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Carica .env.local
config({ path: resolve(process.cwd(), '.env.local') })

async function seedAdmin() {
  const { Redis } = await import('@upstash/redis')
  const bcrypt = await import('bcryptjs')
  const { v4: uuidv4 } = await import('uuid')

  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })

  const id = uuidv4()
  const now = new Date().toISOString()
  const passwordHash = await bcrypt.hash('Admin@MondoSport2024!', 12)

  const admin = {
    id,
    tipo: 'admin',
    stato: 'approved',
    alias: 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@mondosport.it',
    passwordHash,
    nome: 'Admin',
    cognome: 'MondoSport',
    dataNascita: '1990-01-01',
    codiceFiscale: 'ADMINADMIN000000',
    telefono: '+390000000000',
    annoDiNascita: 1990,
    comune: 'Roma',
    regione: 'Lazio',
    sport: ['calcio'],
    sportPrimario: 'calcio',
    ruoli: ['Admin'],
    categoria: ['Senior'],
    statoAnnuncio: 'nascosto',
    mostraAliasInChat: true,
    emailVerificato: true,
    telefonoVerificato: true,
    alertAttivi: [],
    createdAt: now,
    updatedAt: now,
  }

  const pipe = redis.pipeline()
  pipe.set(`user:${id}`, JSON.stringify(admin))
  pipe.set(`user:email:${admin.email.toLowerCase()}`, id)
  pipe.set(`user:alias:admin`, id)
  pipe.sadd('users:approved', id)
  await pipe.exec()

  console.log('✅ Admin creato con successo!')
  console.log(`📧 Email: ${admin.email}`)
  console.log(`🔑 Password: Admin@MondoSport2024!`)
  console.log(`🆔 ID: ${id}`)
  console.log('')
  console.log('⚠️  CAMBIA LA PASSWORD dopo il primo accesso!')
}

seedAdmin().catch(console.error)
