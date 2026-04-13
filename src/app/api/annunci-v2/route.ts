import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { cercaAnnunciV2, creaAnnuncio, getAnnunciUtente } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import type { Annuncio, TipoAnnuncio, Sport } from '@/types'
import { processaUrlMedia } from '@/lib/videoUtils'

export async function GET(req: NextRequest) {
  const session = await auth()
  const isGuest = !session?.user
  const { searchParams: p } = new URL(req.url)

  const userId = p.get('userId')
  if (userId) {
    const annunci = await getAnnunciUtente(userId)
    return NextResponse.json({ annunci, total: annunci.length })
  }

  const { annunci, total } = await cercaAnnunciV2({
    sport: p.get('sport') || undefined,
    ruolo: p.get('ruolo') || undefined,
    regione: p.get('regione') || undefined,
    comune: p.get('comune') || undefined,
    categoria: p.get('categoria') || undefined,
    tipo: p.get('tipo') || undefined,
    soloAttivi: p.get('soloAttivi') === 'true',
    kmMax: p.get('kmMax') ? Number(p.get('kmMax')) : undefined,
    comuneRicerca: p.get('comuneRicerca') || undefined,
    page: Number(p.get('page')) || 1,
    limit: 20,
  }, isGuest)

  return NextResponse.json({ success: true, data: annunci, total, isGuest })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const body = await req.json()
  if (!body.titolo?.trim()) return NextResponse.json({ error: 'Titolo obbligatorio' }, { status: 400 })
  if (!body.tipo) return NextResponse.json({ error: 'Tipo obbligatorio' }, { status: 400 })

  const isAdminCreated = body.isAdminCreated === true
  if (isAdminCreated) {
    const { getUtente } = await import('@/lib/db')
    const u = await getUtente(session.user.id!)
    if (u?.tipo !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  }

  const noSportTypes = ['cerca_sponsor', 'offre_sponsorizzazione']
  if (!body.sport && !noSportTypes.includes(body.tipo) && !isAdminCreated) {
    return NextResponse.json({ error: 'Sport obbligatorio' }, { status: 400 })
  }

  // ── Media Google Drive ────────────────────────────────────────────────────
  // I file fisici restano su Google Drive. Su Redis salviamo SOLO i link.
  let mediaGoogleDrive = undefined
  if (Array.isArray(body.mediaGoogleDrive) && body.mediaGoogleDrive.length > 0) {
    if (typeof body.mediaGoogleDrive[0] === 'string') {
      mediaGoogleDrive = processaUrlMedia(body.mediaGoogleDrive)
    } else {
      mediaGoogleDrive = body.mediaGoogleDrive.slice(0, 5)
    }
    if (mediaGoogleDrive.length === 0) mediaGoogleDrive = undefined
  }
  // ─────────────────────────────────────────────────────────────────────────

  const now = new Date().toISOString()
  const ann: any = {
    id: uuidv4(),
    userId: isAdminCreated ? body.userId : session.user.id!,
    tipo: body.tipo as TipoAnnuncio,
    titolo: body.titolo.trim(),
    descrizione: body.descrizione?.trim() || '',
    sport: body.sport as Sport || undefined,
    ruoli: body.ruoli || [],
    categoria: body.categoria || [],
    comune: body.comune || '',
    regione: body.regione || '',
    kmRaggio: body.kmRaggio ? Number(body.kmRaggio) : undefined,
    nSquadreRicercate: body.nSquadreRicercate ? Number(body.nSquadreRicercate) : undefined,
    dataInizio: body.dataInizio || undefined,
    dataFine: body.dataFine || undefined,
    luogo: body.luogo || undefined,
    attivo: true,
    chiuso: body.chiuso || false,
    chiusoAt: body.chiuso ? now : null,
    scadeAt: body.chiuso
      ? new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
      : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    createdAt: now, updatedAt: now, bumpedAt: now,
    linkFacebook: body.linkFacebook || undefined,
    linkInstagram: body.linkInstagram || undefined,
    linkYouTube: body.linkYouTube || undefined,
    linkSito: body.linkSito || undefined,
    mediaGoogleDrive,
    settore: body.settore || undefined,
    budget: body.budget || undefined,
    benefici: body.benefici || undefined,
    piede: body.piede || undefined,
    altezza: body.altezza || undefined,
    ...(isAdminCreated && {
      alias: body.alias || undefined,
      nomeSocieta: body.nomeSocieta || undefined,
      tipoUtente: body.tipoUtente || 'atleta',
      isAdminCreated: true,
    }),
  }

  await creaAnnuncio(ann)
  return NextResponse.json({ success: true, data: ann })
}