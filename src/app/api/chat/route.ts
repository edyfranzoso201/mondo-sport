import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  creaOGetConversazione,
  getConversazioniUtente,
  getMessaggi,
  inviaMessaggio,
  getUtente,
} from '@/lib/db'

// GET /api/chat — lista conversazioni
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const conversazioni = await getConversazioniUtente(session.user.id!)
  return NextResponse.json({ success: true, data: conversazioni })
}

// POST /api/chat — avvia o recupera conversazione
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { destinatarioId } = await req.json()
  if (!destinatarioId) return NextResponse.json({ error: 'ID destinatario mancante' }, { status: 400 })

  // Verifica che il destinatario esista e sia approvato
  const destinatario = await getUtente(destinatarioId)
  if (!destinatario || destinatario.stato !== 'approved') {
    return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
  }

  const conv = await creaOGetConversazione(session.user.id!, destinatarioId)
  return NextResponse.json({ success: true, data: conv })
}
