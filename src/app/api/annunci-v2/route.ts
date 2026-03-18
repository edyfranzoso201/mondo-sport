import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { cercaAnnunciV2, creaAnnuncio, getAnnunciUtente } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import type { Annuncio, TipoAnnuncio, Sport } from '@/types'

export async function GET(req: NextRequest) {
  const session = await auth()
  const isGuest = !session?.user
  const { searchParams: p } = new URL(req.url)

  const { annunci, total } = await cercaAnnunciV2({
    sport: p.get('sport') || undefined,
    ruolo: p.get('ruolo') || undefined,
    regione: p.get('regione') || undefined,
    comune: p.get('comune') || undefined,
    categoria: p.get('categoria') || undefined,
    tipo: p.get('tipo') || undefined,
    soloAttivi: p.get('soloAttivi') === 'true',
    kmMax: p.get('kmMax') ? Number(p.get('kmMax')) : undefined,
    comuneRicerca: p.get('comuneRicerca') || undefined,
    page: Number(p.get('page')) || 1,
    limit: 20,
  }, isGuest)

  return NextResponse.json({ success: true, data: annunci, total, isGuest })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const body = await req.json()
  if (!body.titolo?.trim()) return NextResponse.json({ error: 'Titolo obbligatorio' }, { status: 400 })
  if (!body.sport) return NextResponse.json({ error: 'Sport obbligatorio' }, { status: 400 })
  if (!body.tipo) return NextResponse.json({ error: 'Tipo obbligatorio' }, { status: 400 })

  const now = new Date().toISOString()
  const ann: Annuncio = {
    id: uuidv4(),
    userId: session.user.id!,
    tipo: body.tipo as TipoAnnuncio,
    titolo: body.titolo.trim(),
    descrizione: body.descrizione?.trim() || '',
    sport: body.sport as Sport,
    ruoli: body.ruoli || [],
    categoria: body.categoria || [],
    comune: body.comune || '',
    regione: body.regione || '',
    kmRaggio: body.kmRaggio ? Number(body.kmRaggio) : undefined,
    nSquadreRicercate: body.nSquadreRicercate ? Number(body.nSquadreRicercate) : undefined,
    dataInizio: body.dataInizio || undefined,
    dataFine: body.dataFine || undefined,
    luogo: body.luogo || undefined,
    attivo: true,
    scadeAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    createdAt: now,
    updatedAt: now,
    bumpedAt: now,
  }

  await creaAnnuncio(ann)
  return NextResponse.json({ success: true, data: ann })
}
