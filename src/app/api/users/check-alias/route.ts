import { NextRequest, NextResponse } from 'next/server'
import { aliasDisponibile } from '@/lib/db'

export async function GET(req: NextRequest) {
  const alias = req.nextUrl.searchParams.get('alias')
  if (!alias || alias.length < 3) {
    return NextResponse.json({ disponibile: false, error: 'Alias troppo corto' })
  }
  if (!/^[a-zA-Z0-9_]+$/.test(alias)) {
    return NextResponse.json({ disponibile: false, error: 'Solo lettere, numeri e _' })
  }
  const disponibile = await aliasDisponibile(alias)
  return NextResponse.json({ disponibile })
}
