/**
 * Elimina automaticamente gli annunci scaduti:
 * - "Non disponibile" da più di 3 mesi (chiuso = true, scadeAt superato)
 * - Annunci normali non aggiornati da più di 1 anno (scadeAt superato)
 *
 * Esegui manualmente o schedulalo (es. cron mensile):
 *   npx tsx scripts/pulizia-annunci.ts
 */
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  const { Redis } = await import('@upstash/redis')
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })

  const ora = new Date()
  const allIds = await redis.zrange('annunci:recenti:v2', 0, -1) as string[]

  let eliminati = 0
  let scaduti_norm = 0
  let scaduti_chiusi = 0

  for (const id of allIds) {
    const raw = await redis.get(`annuncio:${id}`) as any
    if (!raw) { await redis.zrem('annunci:recenti:v2', id); continue }

    const ann = typeof raw === 'string' ? JSON.parse(raw) : raw

    // Controlla scadenza
    if (ann.scadeAt && new Date(ann.scadeAt) < ora) {
      console.log(`🗑  Elimino: "${ann.titolo}" (${ann.chiuso ? 'Non disponibile' : 'Scaduto'}) — scadeva: ${ann.scadeAt}`)

      const pipe = redis.pipeline()
      pipe.del(`annuncio:${id}`)
      pipe.srem(`user:annunci:${ann.userId}`, id)
      pipe.srem(`ann:sport:${ann.sport}`, id)
      pipe.srem(`ann:regione:${(ann.regione || '').toLowerCase()}`, id)
      pipe.srem(`ann:tipo:${ann.tipo}`, id)
      pipe.zrem('annunci:recenti:v2', id)
      await pipe.exec()

      if (ann.chiuso) scaduti_chiusi++
      else scaduti_norm++
      eliminati++
    }
  }

  console.log(`\n✅ Pulizia completata:`)
  console.log(`   ${scaduti_chiusi} annunci "Non disponibile" eliminati (>3 mesi)`)
  console.log(`   ${scaduti_norm} annunci normali eliminati (>1 anno)`)
  console.log(`   ${eliminati} totale eliminati su ${allIds.length} annunci`)
}

main().catch(console.error)
