import { NextResponse } from 'next/server'
import { redis } from '@/lib/db'

export const runtime = 'edge'

export async function GET() {
  try {
    // Prendi gli ultimi 8 ID
    const ids = await redis.zrange('annunci:recenti:v2', -8, -1, { rev: true }) as string[]
    if (!ids || ids.length === 0) return NextResponse.json({ annunci: [] })

    // Batch fetch con pipeline
    const pipe = redis.pipeline()
    ids.forEach(id => pipe.get(`annuncio:${id}`))
    const results = await pipe.exec()

    const annunci = results
      .map((raw: any) => {
        try {
          const ann = typeof raw === 'string' ? JSON.parse(raw) : raw
          if (!ann || !ann.attivo) return null
          return {
            id: ann.id,
            titolo: ann.titolo,
            tipo: ann.tipo,
            sport: ann.sport,
            comune: ann.comune,
            chiuso: ann.chiuso,
            bumpedAt: ann.bumpedAt,
            autore: { tipo: ann.tipoUtente || 'atleta' },
          }
        } catch { return null }
      })
      .filter(Boolean)

    return NextResponse.json({ annunci })
  } catch {
    return NextResponse.json({ annunci: [] })
  }
}
