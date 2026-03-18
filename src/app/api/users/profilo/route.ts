import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { aggiornaUtente, getUtente, estraiProfiloPubblico, redis } from '@/lib/db'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const body = await req.json()

  const campiConsentiti = ['statoAnnuncio', 'mostraAliasInChat', 'mostraNomeSocieta', 'nascondiRuolo', 'descrizione', 'notificheEmailChat']
  const updates: any = {}
  campiConsentiti.forEach(k => {
    if (body[k] !== undefined) updates[k] = body[k]
  })

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nessun campo valido' }, { status: 400 })
  }

  await aggiornaUtente(session.user.id!, updates)

  // Rigenera il profilo pubblico con i nuovi dati
  const utente = await getUtente(session.user.id!)
  if (utente) {
    const profilo = estraiProfiloPubblico(utente)
    await redis.set(`profile:${utente.id}`, JSON.stringify(profilo))
  }

  return NextResponse.json({ success: true })
}
