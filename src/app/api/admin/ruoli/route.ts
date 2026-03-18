import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUtente, getRuoliPersonalizzati, salvaRuoliPersonalizzati } from '@/lib/db'
import { RUOLI_PER_SPORT } from '@/types'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const u = await getUtente(session.user.id!)
  if (u?.tipo !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

  const personalizzati = await getRuoliPersonalizzati()
  // Merge con i default
  const ruoli = personalizzati || { ...RUOLI_PER_SPORT }
  return NextResponse.json({ success: true, data: ruoli })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const u = await getUtente(session.user.id!)
  if (u?.tipo !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

  const body = await req.json()
  if (!body.ruoli || typeof body.ruoli !== 'object') {
    return NextResponse.json({ error: 'Dati non validi' }, { status: 400 })
  }

  await salvaRuoliPersonalizzati(body.ruoli)
  return NextResponse.json({ success: true })
}
