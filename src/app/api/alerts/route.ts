import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { salvaAlert, getAlertsUtente, redis } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import type { AlertConfig } from '@/types'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const alerts = await getAlertsUtente(session.user.id!)
  return NextResponse.json({ success: true, data: alerts })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const body = await req.json()
  const alert: AlertConfig = {
    id: uuidv4(),
    userId: session.user.id!,
    sport: body.sport || undefined,
    ruolo: body.ruolo || undefined,
    regione: body.regione || undefined,
    comune: body.comune || undefined,
    categoria: body.categoria || undefined,
    raggio: body.raggio || undefined,
    createdAt: new Date().toISOString(),
    attivo: true,
  }
  await salvaAlert(alert)
  return NextResponse.json({ success: true, data: alert })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const { alertId } = await req.json()
  const alerts = await getAlertsUtente(session.user.id!)
  const updated = alerts.filter((a: AlertConfig) => a.id !== alertId)
  await redis.set(`alerts:${session.user.id}`, JSON.stringify(updated))
  return NextResponse.json({ success: true })
}
