import { NextResponse } from 'next/server'
import { getSlotsAd } from '@/lib/db'

export async function GET() {
  const slots = await getSlotsAd()
  // Restituisce solo slot attivi (no dati sensibili)
  const pubblici = slots.map(s => ({
    id: s.id,
    tipo: s.tipo,
    titolo: s.titolo,
    sottotitolo: s.sottotitolo,
    coloresfondo: s.coloresfondo,
    coloretesto: s.coloretesto,
    urlEsterno: s.urlEsterno,
    apriNuovaTab: s.apriNuovaTab,
    paginaInterna: s.paginaInterna,
    immagineUrl: s.immagineUrl,
    attivo: s.attivo,
  }))
  return NextResponse.json({ success: true, data: pubblici })
}
