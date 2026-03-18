import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { cercaAnnunci } from '@/lib/db'
import type { FiltriRicerca, Sport } from '@/types'

const COORDINATE_COMUNI: Record<string, [number, number]> = {
  'torino': [45.0703, 7.6869], 'grugliasco': [45.0628, 7.5783], 'moncalieri': [44.9983, 7.6822],
  'collegno': [45.0786, 7.5632], 'rivoli': [45.0712, 7.5122], 'nichelino': [44.9956, 7.6439],
  'settimo torinese': [45.1378, 7.7636], 'chieri': [44.9958, 7.8231],
  'milano': [45.4642, 9.1900], 'roma': [41.9028, 12.4964], 'napoli': [40.8518, 14.2681],
  'bologna': [44.4949, 11.3426], 'firenze': [43.7696, 11.2558], 'venezia': [45.4408, 12.3155],
  'genova': [44.4056, 8.9463], 'palermo': [38.1157, 13.3615], 'bari': [41.1171, 16.8719],
  'catania': [37.5079, 15.0830], 'verona': [45.4384, 10.9916], 'padova': [45.4064, 11.8768],
  'trieste': [45.6495, 13.7768], 'brescia': [45.5416, 10.2118], 'modena': [44.6471, 10.9252],
  'parma': [44.8015, 10.3279], 'prato': [43.8777, 11.1026], 'reggio emilia': [44.6989, 10.6297],
  'perugia': [43.1122, 12.3888], 'livorno': [43.5485, 10.3106], 'ravenna': [44.4184, 12.2035],
  'cagliari': [39.2238, 9.1217], 'foggia': [41.4621, 15.5440], 'salerno': [40.6824, 14.7681],
  'rimini': [44.0595, 12.5683], 'ferrara': [44.8381, 11.6197], 'ancona': [43.6158, 13.5189],
  'como': [45.8080, 9.0852], 'bergamo': [45.6983, 9.6773], 'vicenza': [45.5455, 11.5354],
  'trento': [46.0748, 11.1217], 'bolzano': [46.4983, 11.3548], 'udine': [46.0711, 13.2347],
  'taranto': [40.4644, 17.2470], 'reggio calabria': [38.1113, 15.6636], 'messina': [38.1938, 15.5540],
  'siracusa': [37.0755, 15.2866], 'pescara': [42.4618, 14.2160], 'novara': [45.4468, 8.6220],
  'asti': [44.9004, 8.2065], 'cuneo': [44.3865, 7.5422], 'alessandria': [44.9122, 8.6151],
  'biella': [45.5659, 8.0531], 'vercelli': [45.3274, 8.4249], 'pinerolo': [44.8882, 7.3530],
  'chivasso': [45.1902, 7.8879], 'ivrea': [45.4657, 7.8748], 'orbassano': [44.9928, 7.5354],
  'carmagnola': [44.8500, 7.7167], 'bra': [44.6950, 7.8535], 'alba': [44.6986, 8.0358],
}

function getCoords(comune: string): [number, number] | null {
  return COORDINATE_COMUNI[comune.toLowerCase().trim()] || null
}

function distanzaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export interface GruppoComune {
  comune: string
  lat: number
  lon: number
  count: number
  distanza: number
  profili: Array<{
    id: string; alias: string; annoDiNascita: number
    ruoli: string[]; sport: string[]; statoAnnuncio: string
    nomeSocieta?: string; descrizione?: string
  }>
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const filtri: FiltriRicerca = {
    sport: searchParams.get('sport') as Sport | undefined,
    ruolo: searchParams.get('ruolo') || undefined,
    regione: searchParams.get('regione') || undefined,
    categoria: searchParams.get('categoria') || undefined,
    limit: 500,
  }

  const raggio = Number(searchParams.get('raggio')) || 50
  const centroLat = searchParams.get('lat') ? Number(searchParams.get('lat')) : null
  const centroLon = searchParams.get('lon') ? Number(searchParams.get('lon')) : null

  const { profili } = await cercaAnnunci(filtri, false)

  const gruppiMap: Record<string, GruppoComune> = {}

  for (const p of profili) {
    const coords = getCoords(p.comune)
    if (!coords) continue
    const [lat, lon] = coords
    const dist = (centroLat && centroLon) ? distanzaKm(centroLat, centroLon, lat, lon) : 0
    if (centroLat && centroLon && dist > raggio) continue

    const key = p.comune.toLowerCase()
    if (!gruppiMap[key]) {
      gruppiMap[key] = { comune: p.comune, lat, lon, count: 0, distanza: dist, profili: [] }
    }
    gruppiMap[key].count++
    gruppiMap[key].profili.push({
      id: p.id, alias: p.nomeSocieta || p.alias,
      annoDiNascita: p.annoDiNascita,
      ruoli: p.ruoli, sport: p.sport,
      statoAnnuncio: p.statoAnnuncio,
      nomeSocieta: p.nomeSocieta,
      descrizione: (p as any).descrizione,
    })
  }

  const gruppi = Object.values(gruppiMap).sort((a, b) => a.distanza - b.distanza)
  return NextResponse.json({ success: true, data: gruppi, centroLat, centroLon })
}
