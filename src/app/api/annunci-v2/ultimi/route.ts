import { NextResponse } from 'next/server'
import { redis } from '@/lib/db'
import type { Annuncio } from '@/types'

// Ritorna gli annunci dell'ultimo giorno
// Se non ce ne sono, ritorna gli ultimi 8 in assoluto
export async function GET() {
  const ieri = Date.now() - 24 * 60 * 60 * 1000

  // Prova prima con annunci delle ultime 24h
  let ids = await redis.zrange('annunci:recenti:v2', ieri, '+inf', { byScore: true }) as string[]

  // Se vuoto, prendi gli ultimi 8
  if (!ids || ids.length === 0) {
    ids = await redis.zrange('annunci:recenti:v2', -8, -1, { rev: true }) as string[]
  }

  const annunci = []
  for (const id of ids.slice(0, 12)) {
    const raw = await redis.get(`annuncio:${id}`) as any
    if (!raw) continue
    const ann = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!ann.attivo) continue
    annunci.push({
      id: ann.id,
      titolo: ann.titolo,
      tipo: ann.tipo,
      sport: ann.sport,
      comune: ann.comune,
      regione: ann.regione,
      chiuso: ann.chiuso,
      bumpedAt: ann.bumpedAt,
      autore: { tipo: ann.tipoUtente || 'atleta' },
    })
  }

  // Ordina per bumpedAt decrescente
  annunci.sort((a, b) => new Date(b.bumpedAt).getTime() - new Date(a.bumpedAt).getTime())

  return NextResponse.json({ annunci })
}
