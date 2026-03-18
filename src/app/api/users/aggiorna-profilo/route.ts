import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUtente, estraiProfiloPubblico, redis } from '@/lib/db'

export async function POST() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const utente = await getUtente(session.user.id!)
  if (!utente) return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })

  const profilo = estraiProfiloPubblico(utente)
  await redis.set(`profile:${utente.id}`, JSON.stringify(profilo))

  return NextResponse.json({ success: true })
}
