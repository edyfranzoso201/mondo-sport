import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { redis } from '@/lib/db'
import { getCoords, distanzaKm } from '@/lib/comuni'

export interface GruppoComune {
  comune: string
  lat: number
  lon: number
  count: number
  distanza: number
  profili: Array<{
    id: string; alias: string; tipo: string
    ruoli: string[]; sport: string; titolo: string
    chiuso?: boolean; nomeSocieta?: string
  }>
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const raggio = Number(searchParams.get('raggio')) || 50
  const centroLat = searchParams.get('lat') ? Number(searchParams.get('lat')) : null
  const centroLon = searchParams.get('lon') ? Number(searchParams.get('lon')) : null
  const sportFiltro = searchParams.get('sport') || undefined

  // Prende tutti gli annunci dal sorted set
  const allIds = await redis.zrange('annunci:recenti:v2', 0, -1) as string[]
  const gruppiMap: Record<string, GruppoComune> = {}

  for (const id of allIds) {
    const raw = await redis.get(`annuncio:${id}`) as any
    if (!raw) continue
    const ann = typeof raw === 'string' ? JSON.parse(raw) : raw

    if (!ann.attivo) continue
    if (sportFiltro && ann.sport !== sportFiltro) continue

    const coords = getCoords(ann.comune)
    if (!coords) continue
    const [lat, lon] = coords

    const dist = (centroLat && centroLon) ? distanzaKm(centroLat, centroLon, lat, lon) : 0
    if (centroLat && centroLon && dist > raggio) continue

    const key = ann.comune.toLowerCase()
    if (!gruppiMap[key]) {
      gruppiMap[key] = { comune: ann.comune, lat, lon, count: 0, distanza: dist, profili: [] }
    }
    gruppiMap[key].count++
    if (gruppiMap[key].profili.length < 10) {
      gruppiMap[key].profili.push({
        id: ann.id,
        alias: ann.nomeSocieta || ann.alias,
        tipo: ann.tipoUtente || 'atleta',
        ruoli: ann.ruoli || [],
        sport: ann.sport,
        titolo: ann.titolo,
        chiuso: ann.chiuso,
        nomeSocieta: ann.nomeSocieta,
      })
    }
  }

  const gruppi = Object.values(gruppiMap).sort((a, b) => b.count - a.count)
  return NextResponse.json({ success: true, data: gruppi, centroLat, centroLon })
}
