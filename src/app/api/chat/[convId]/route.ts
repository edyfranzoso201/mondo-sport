import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getMessaggi, inviaMessaggio, getConversazioniUtente, redis, getUtente } from '@/lib/db'
import { inviaEmailNuovoMessaggio } from '@/lib/email'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ convId: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { convId } = await params
  const convs = await getConversazioniUtente(session.user.id!)
  const conv = convs.find(c => c.id === convId)
  if (!conv) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

  const messaggi = await getMessaggi(convId)

  // Pulisci messaggi vecchi oltre i 20 (cleanup on read)
  await redis.ltrim(`msgs:${convId}`, 0, 19)

  // Azzera non letti
  if ((conv.nonLetti[session.user.id!] || 0) > 0) {
    conv.nonLetti[session.user.id!] = 0
    await redis.set(`conv:${convId}`, JSON.stringify(conv))
  }

  return NextResponse.json({ success: true, data: messaggi })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ convId: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { convId } = await params
  const convs = await getConversazioniUtente(session.user.id!)
  const conv = convs.find(c => c.id === convId)
  if (!conv) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

  const { testo } = await req.json()
  if (!testo?.trim()) return NextResponse.json({ error: 'Testo mancante' }, { status: 400 })
  if (testo.length > 1000) return NextResponse.json({ error: 'Messaggio troppo lungo' }, { status: 400 })

  const mittente = await getUtente(session.user.id!)
  const msg = await inviaMessaggio(convId, session.user.id!, testo.trim())

  // Notifica email ai destinatari che hanno le notifiche attive
  const altriIds = conv.partecipanti.filter(p => p !== session.user!.id)
  for (const destId of altriIds) {
    try {
      const dest = await getUtente(destId)
      if (dest && (dest as any).notificheEmailChat !== false) {
        const nomeSmtp = process.env.SMTP_USER
        if (nomeSmtp && nomeSmtp !== '' && !nomeSmtp.includes('tua@')) {
          await inviaEmailNuovoMessaggio(
  		dest.email,
  		dest.alias,
  		mittente?.alias || 'Un utente'
		)      
 	}
      }
    } catch { /* ignora errori email */ }
  }
  return NextResponse.json({ success: true, data: msg })
}
