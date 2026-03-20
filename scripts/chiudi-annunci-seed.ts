/**
 * Chiude tutti gli annunci seed (userId che inizia con "seed_")
 * Esegui: npx tsx scripts/chiudi-annunci-seed.ts
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

  const allIds = await redis.zrange('annunci:recenti:v2', 0, -1) as string[]
  let aggiornati = 0

  for (const id of allIds) {
    const raw = await redis.get(`annuncio:${id}`) as any
    if (!raw) continue
    const ann = typeof raw === 'string' ? JSON.parse(raw) : raw

    if (ann.userId?.startsWith('seed_') && !ann.chiuso) {
      const ora = new Date()
      const scadenza = new Date(ora)
      scadenza.setMonth(scadenza.getMonth() + 3)
      ann.chiuso = true
      ann.chiusoAt = ora.toISOString()
      ann.scadeAt = scadenza.toISOString()
      await redis.set(`annuncio:${id}`, JSON.stringify(ann))
      aggiornati++
    }
  }

  console.log(`✅ Chiusi ${aggiornati} annunci seed`)
}

main().catch(console.error)
