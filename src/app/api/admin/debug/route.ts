import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUtente, redis } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const utente = await getUtente(session.user.id!)
  if (utente?.tipo !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

  // Leggi tutti i set
  const pending = await redis.smembers('users:pending')
  const approved = await redis.smembers('users:approved')

  // Leggi i dati di ogni utente approved
  const utentiApproved = await Promise.all(
    approved.map(async (id) => {
      const u = await getUtente(id)
      return { id, alias: u?.alias, stato: u?.stato, tipo: u?.tipo, email: u?.email }
    })
  )
  const utentiPending = await Promise.all(
    pending.map(async (id) => {
      const u = await getUtente(id)
      return { id, alias: u?.alias, stato: u?.stato, tipo: u?.tipo, email: u?.email }
    })
  )

  return NextResponse.json({
    pending: { count: pending.length, ids: pending, utenti: utentiPending },
    approved: { count: approved.length, ids: approved, utenti: utentiApproved },
  })
}

// POST: forza approvazione manuale per ID
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const adminUtente = await getUtente(session.user.id!)
  if (adminUtente?.tipo !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

  const { userId } = await req.json()
  const utente = await getUtente(userId)
  if (!utente) return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })

  // Forza approvazione completa
  const pipe = redis.pipeline()
  pipe.srem('users:pending', userId)
  pipe.sadd('users:approved', userId)
  utente.sport.forEach((s: string) => pipe.sadd(`idx:sport:${s}`, userId))
  pipe.sadd(`idx:regione:${utente.regione.toLowerCase()}`, userId)
  utente.ruoli.forEach((r: string) => pipe.sadd(`idx:ruolo:${r.toLowerCase()}`, userId))
  utente.categoria.forEach((c: string) => pipe.sadd(`idx:cat:${c.toLowerCase()}`, userId))
  const updated = { ...utente, stato: 'approved', updatedAt: new Date().toISOString() }
  pipe.set(`user:${userId}`, JSON.stringify(updated))
  pipe.set(`profile:${userId}`, JSON.stringify({
    id: userId, tipo: utente.tipo, alias: utente.alias,
    annoDiNascita: utente.annoDiNascita, comune: utente.comune,
    regione: utente.regione, sport: utente.sport, sportPrimario: utente.sportPrimario,
    ruoli: utente.ruoli, categoria: utente.categoria,
    statoAnnuncio: utente.statoAnnuncio, createdAt: utente.createdAt,
  }))
  await pipe.exec()

  return NextResponse.json({ success: true, message: `${utente.alias} approvato correttamente` })
}
