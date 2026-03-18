import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { cercaAnnunci } from '@/lib/db'
import type { FiltriRicerca, Sport } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const isGuest = !session?.user

    const { searchParams } = new URL(req.url)
    const filtri: FiltriRicerca = {
      sport: searchParams.get('sport') as Sport | undefined,
      ruolo: searchParams.get('ruolo') || undefined,
      regione: searchParams.get('regione') || undefined,
      comune: searchParams.get('comune') || undefined,
      categoria: searchParams.get('categoria') || undefined,
      tipo: searchParams.get('tipo') as any || undefined,
      statoAnnuncio: searchParams.get('statoAnnuncio') as any || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
    }

    const { profili, total } = await cercaAnnunci(filtri, isGuest)

    return NextResponse.json({
      success: true,
      data: profili,
      total,
      page: filtri.page,
      isGuest,
      limit: isGuest ? 10 : filtri.limit,
    })
  } catch (err) {
    console.error('Errore ricerca annunci:', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
