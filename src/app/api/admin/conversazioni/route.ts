import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUtente, redis } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const admin = await getUtente(session.user.id!)
  if (admin?.tipo !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

  const keys = await redis.keys('conv:*')
  const convKeys = keys.filter((k: string) => !k.includes('conv:users:'))

  const conversazioni = []
  for (const key of convKeys) {
    const raw = await redis.get(key) as any
    if (!raw) continue
    const conv = typeof raw === 'string' ? JSON.parse(raw) : raw
    const partecipanti = []
    for (const uid of conv.partecipanti || []) {
      const u = await getUtente(uid)
      partecipanti.push({ id: uid, alias: u?.alias || 'Utente eliminato' })
    }
    const msgs = await redis.lrange(`msgs:${conv.id}`, 0, -1)
    const messaggi = msgs.map((m: any) => typeof m === 'string' ? JSON.parse(m) : m)
    conversazioni.push({ ...conv, partecipanti, messaggi })
  }

  conversazioni.sort((a, b) => new Date(b.ultimaAttivita || 0).getTime() - new Date(a.ultimaAttivita || 0).getTime())
  return NextResponse.json({ conversazioni })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const admin = await getUtente(session.user.id!)
  if (admin?.tipo !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

  const { convId, msgIndex } = await req.json()
  if (!convId) return NextResponse.json({ error: 'convId mancante' }, { status: 400 })

  if (msgIndex !== undefined) {
    const msgs = await redis.lrange(`msgs:${convId}`, 0, -1)
    if (msgIndex >= 0 && msgIndex < msgs.length) {
      const msg = typeof msgs[msgIndex] === 'string' ? JSON.parse(msgs[msgIndex] as string) : msgs[msgIndex]
      msg.testo = '🚫 Messaggio eliminato dall\'amministratore'
      msg.eliminato = true
      await redis.lset(`msgs:${convId}`, msgIndex, JSON.stringify(msg))
    }
    return NextResponse.json({ success: true, tipo: 'messaggio' })
  }

  const raw = await redis.get(`conv:${convId}`) as any
  if (raw) {
    const conv = typeof raw === 'string' ? JSON.parse(raw) : raw
    const pipe = redis.pipeline()
    pipe.del(`conv:${convId}`)
    pipe.del(`msgs:${convId}`)
    for (const uid of conv.partecipanti || []) {
      pipe.srem(`user:convs:${uid}`, convId)
    }
    if (conv.partecipanti?.length === 2) {
      const sorted = [...conv.partecipanti].sort()
      pipe.del(`conv:users:${sorted[0]}:${sorted[1]}`)
    }
    await pipe.exec()
  }
  return NextResponse.json({ success: true, tipo: 'conversazione' })
}
