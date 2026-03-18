import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getConversazioniUtente } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ totale: 0 })

  const convs = await getConversazioniUtente(session.user.id!)
  const totale = convs.reduce((sum, c) => sum + (c.nonLetti[session.user!.id!] || 0), 0)
  return NextResponse.json({ totale })
}
