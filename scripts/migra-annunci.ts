/**
 * Migra i vecchi profili utente (statoAnnuncio: disponibile/cerca) 
 * nel nuovo sistema annunci V2.
 * 
 * Esegui una sola volta:
 *   npx tsx scripts/migra-annunci.ts
 */
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  const { Redis } = await import('@upstash/redis')
  const { v4: uuidv4 } = await import('uuid')

  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })

  const approvedIds = await redis.smembers('users:approved')
  let migrati = 0

  for (const userId of approvedIds) {
    const raw = await redis.get(`user:${userId}`) as any
    if (!raw) continue
    const u = typeof raw === 'string' ? JSON.parse(raw) : raw

    // Salta admin e utenti nascosti
    if (u.tipo === 'admin') continue
    if (u.statoAnnuncio === 'nascosto') continue

    // Controlla se ha già annunci V2
    const annIds = await redis.smembers(`user:annunci:${userId}`)
    if (annIds.length > 0) {
      console.log(`⏭  ${u.alias} — già ha ${annIds.length} annunci V2, salto`)
      continue
    }

    // Crea annuncio V2 dal profilo
    const tipo = u.statoAnnuncio === 'cerca' ? 'ricerca_squadra' : 'disponibilita'
    const titoloBase = tipo === 'ricerca_squadra'
      ? `${u.ruoli?.[0] || 'Atleta'} cerca squadra`
      : `${u.ruoli?.[0] || 'Atleta'} disponibile`

    const annId = uuidv4()
    const now = u.updatedAt || u.createdAt || new Date().toISOString()

    const annuncio = {
      id: annId,
      userId,
      tipo,
      titolo: titoloBase,
      descrizione: u.descrizione || '',
      sport: u.sportPrimario || u.sport?.[0] || 'calcio',
      ruoli: u.ruoli || [],
      categoria: u.categoria || [],
      comune: u.comune || '',
      regione: u.regione || '',
      attivo: true,
      createdAt: now,
      updatedAt: now,
      bumpedAt: now,
    }

    const pipe = redis.pipeline()
    pipe.set(`annuncio:${annId}`, JSON.stringify(annuncio))
    pipe.sadd(`user:annunci:${userId}`, annId)
    pipe.sadd(`ann:sport:${annuncio.sport}`, annId)
    pipe.sadd(`ann:regione:${annuncio.regione?.toLowerCase()}`, annId)
    pipe.sadd(`ann:tipo:${annuncio.tipo}`, annId)
    pipe.zadd('annunci:recenti:v2', { score: new Date(now).getTime(), member: annId })
    await pipe.exec()

    console.log(`✅ Migrato: ${u.alias} → "${titoloBase}" (${annuncio.sport}, ${annuncio.comune})`)
    migrati++
  }

  console.log(`\n✅ Migrazione completata: ${migrati} annunci creati\n`)
}

main().catch(console.error)
