import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { aggiornaAnnuncio, eliminaAnnuncio, redis } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const { id } = await params

  // Verifica proprietà
  const raw = await redis.get(`annuncio:${id}`)
  if (!raw) return NextResponse.json({ error: 'Non trovato' }, { status: 404 })
  const ann = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (ann.userId !== session.user.id) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

  const body = await req.json()
  const updated = await aggiornaAnnuncio(id, body)
  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const { id } = await params

  const raw = await redis.get(`annuncio:${id}`)
  if (!raw) return NextResponse.json({ error: 'Non trovato' }, { status: 404 })
  const ann = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (ann.userId !== session.user.id) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

  await eliminaAnnuncio(id, session.user.id!)
  return NextResponse.json({ success: true })
}
