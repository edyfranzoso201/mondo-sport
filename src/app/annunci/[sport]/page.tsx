import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cercaAnnunciV2 } from '@/lib/db'
import { auth } from '@/lib/auth'
import { SPORT_LABELS, SPORT_ICONS } from '@/types'
import type { Sport } from '@/types'
import FiltriBarV2 from '@/components/annunci/FiltriBarV2'
import AnnunciListV2 from '@/components/annunci/AnnunciListV2'
import SidebarAd from '@/components/layout/SidebarAd'
import DocumentiWidget from '@/components/layout/DocumentiWidget'

const SPORT_DESC: Record<string, string> = {
  calcio: 'Trova squadre di calcio, portieri, difensori e attaccanti. Annunci per tornei e amichevoli in Italia.',
  calcio5: 'Annunci calcio a 5: cerca squadre, pivot, ali e portieri. Organizza tornei e amichevoli.',
  pallavolo: 'Trova squadre di pallavolo, palleggiatori, schiacciatori e liberi. Tornei in Italia.',
  basket: 'Annunci basket: cerca squadre, playmaker, ali e centri. Organizza tornei e amichevoli.',
  padel: 'Trova partner di padel, organizza tornei e amichevoli. Annunci per giocatori e istruttori.',
  softair: 'Trova team di softair, cerca operatori e organizza eventi tattici in Italia.',
}

type Props = {
  params: Promise<{ sport: string }>
  searchParams: Promise<Record<string, string>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params
  const sport = p.sport
  const label = SPORT_LABELS[sport as Sport]
  if (!label) return { title: 'Non trovato' }
  return {
    title: `${SPORT_ICONS[sport as Sport]} Annunci ${label} Italia | Mondo Sport`,
    description: SPORT_DESC[sport] || `Annunci ${label} in Italia.`,
    alternates: { canonical: `https://mondo-sport.vercel.app/annunci/${sport}` },
  }
}

export default async function SportPage({ params, searchParams }: Props) {
  const p = await params
  const sp = await searchParams
  const sport = p.sport

  if (!SPORT_LABELS[sport as Sport]) notFound()

  const session = await auth()
  const isGuest = !session?.user
  let isAdmin = false
  if (session?.user) {
    const { getUtente } = await import('@/lib/db')
    const u = await getUtente(session.user.id!)
    isAdmin = u?.tipo === 'admin'
  }

  const filtri = { sport: sport as Sport, page: Number(sp.page) || 1 }
  const { annunci, total } = await cercaAnnunciV2(filtri, isGuest)

  return (
    <main style={{ background: 'var(--ms-bg)', minHeight: '100vh' }}>
      <div style={{ background: 'var(--ms-green)', padding: '16px 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', margin: 0 }}>
          {SPORT_ICONS[sport as Sport]} Annunci {SPORT_LABELS[sport as Sport]} in Italia
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: '6px 0 0' }}>{SPORT_DESC[sport]}</p>
      </div>
      <FiltriBarV2 filtriAttivi={filtri} />
      <div className="ms-layout">
        <SidebarAd position="left" />
        <div className="ms-content">
          <DocumentiWidget />
          <AnnunciListV2 annunci={annunci} total={total} isGuest={isGuest} isAdmin={isAdmin} filtriAttivi={filtri} page={filtri.page} />
        </div>
        <SidebarAd position="right" />
      </div>
    </main>
  )
}

export async function generateStaticParams() {
  return Object.keys(SPORT_LABELS).map(sport => ({ sport }))
}
