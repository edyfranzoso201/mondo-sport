import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUtente, getSlotsAd, salvaSlotAd } from '@/lib/db'
import type { SlotAd } from '@/types'

async function checkAdmin(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return null
  const u = await getUtente(session.user.id!)
  return u?.tipo === 'admin' ? u : null
}

export async function GET(req: NextRequest) {
  const admin = await checkAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const slots = await getSlotsAd()
  return NextResponse.json({ success: true, data: slots })
}

export async function POST(req: NextRequest) {
  const admin = await checkAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const body = await req.json()
  const validIds = ['left-1', 'left-2', 'right-1', 'right-2']
  if (!validIds.includes(body.id)) {
    return NextResponse.json({ error: 'ID slot non valido' }, { status: 400 })
  }

  const slot: SlotAd = {
    id: body.id,
    tipo: body.tipo || 'vuoto',
    titolo: body.titolo || undefined,
    sottotitolo: body.sottotitolo || undefined,
    coloresfondo: body.coloresfondo || '#4a7c8e',
    coloretesto: body.coloretesto || '#ffffff',
    urlEsterno: body.urlEsterno || undefined,
    apriNuovaTab: body.apriNuovaTab !== false,
    paginaInterna: body.paginaInterna || undefined,
    immagineUrl: body.immagineUrl || undefined,
    videoUrl: body.videoUrl || undefined,
    attivo: body.attivo !== false,
    updatedAt: new Date().toISOString(),
  }

  await salvaSlotAd(slot)
  return NextResponse.json({ success: true, data: slot })
}
