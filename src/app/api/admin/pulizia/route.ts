import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUtente, redis } from '@/lib/db'

export async function POST() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const u = await getUtente(session.user.id!)
  if (u?.tipo !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

  const ora = new Date()
  const allIds = await redis.zrange('annunci:recenti:v2', 0, -1) as string[]
  const eliminati: string[] = []

  for (const id of allIds) {
    const raw = await redis.get(`annuncio:${id}`) as any
    if (!raw) { await redis.zrem('annunci:recenti:v2', id); continue }
    const ann = typeof raw === 'string' ? JSON.parse(raw) : raw

    if (ann.scadeAt && new Date(ann.scadeAt) < ora) {
      const pipe = redis.pipeline()
      pipe.del(`annuncio:${id}`)
      pipe.srem(`user:annunci:${ann.userId}`, id)
      pipe.srem(`ann:sport:${ann.sport}`, id)
      pipe.srem(`ann:regione:${(ann.regione || '').toLowerCase()}`, id)
      pipe.srem(`ann:tipo:${ann.tipo}`, id)
      pipe.zrem('annunci:recenti:v2', id)
      await pipe.exec()
      eliminati.push(ann.titolo)
    }
  }

  return NextResponse.json({ success: true, eliminati: eliminati.length, titoli: eliminati })
}
