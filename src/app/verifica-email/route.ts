import { NextRequest, NextResponse } from 'next/server'
import { verificaToken, aggiornaUtente, getUtente } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/accedi?error=token-mancante', req.url))
  }

  const userId = await verificaToken(token)
  if (!userId) {
    return NextResponse.redirect(new URL('/accedi?error=token-scaduto', req.url))
  }

  const utente = await getUtente(userId)
  if (!utente) {
    return NextResponse.redirect(new URL('/accedi?error=utente-non-trovato', req.url))
  }

  await aggiornaUtente(userId, { emailVerificato: true } as any)

  return NextResponse.redirect(
    new URL('/accedi?messaggio=email-verificata', req.url)
  )
}
