import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUtente, redis } from '@/lib/db'

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const admin = await getUtente(session.user.id!)
  if (admin?.tipo !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

  const { annId } = await req.json()
  if (!annId) return NextResponse.json({ error: 'annId mancante' }, { status: 400 })

  const raw = await redis.get(`annuncio:${annId}`) as any
  if (!raw) return NextResponse.json({ error: 'Annuncio non trovato' }, { status: 404 })
  const ann = typeof raw === 'string' ? JSON.parse(raw) : raw

  const pipe = redis.pipeline()
  pipe.del(`annuncio:${annId}`)
  pipe.srem(`user:annunci:${ann.userId}`, annId)
  pipe.srem(`ann:sport:${ann.sport}`, annId)
  pipe.srem(`ann:regione:${(ann.regione || '').toLowerCase()}`, annId)
  pipe.srem(`ann:tipo:${ann.tipo}`, annId)
  pipe.zrem('annunci:recenti:v2', annId)
  await pipe.exec()

  return NextResponse.json({ success: true })
}
