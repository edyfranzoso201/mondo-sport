import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cercaAnnunciV2 } from '@/lib/db'
import { auth } from '@/lib/auth'
import { REGIONI_ITALIA } from '@/types'
import FiltriBarV2 from '@/components/annunci/FiltriBarV2'
import AnnunciListV2 from '@/components/annunci/AnnunciListV2'
import SidebarAd from '@/components/layout/SidebarAd'
import DocumentiWidget from '@/components/layout/DocumentiWidget'

const REGIONE_DESC: Record<string, string> = {
  piemonte: 'Annunci sportivi in Piemonte: trova squadre, atleti e tornei a Torino, Grugliasco, Collegno, Rivoli.',
  toscana: 'Annunci sportivi in Toscana: trova squadre, atleti e tornei a Firenze, Prato, Livorno.',
  lombardia: 'Annunci sportivi in Lombardia: trova squadre, atleti e tornei a Milano, Brescia, Bergamo.',
}

type Props = {
  params: Promise<{ regione: string }>
  searchParams: Promise<Record<string, string>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params
  const regione = p.regione.toLowerCase()
  const label = regione.charAt(0).toUpperCase() + regione.slice(1)
  if (!REGIONI_ITALIA.map(r => r.toLowerCase()).includes(regione)) return { title: 'Non trovato' }
  return {
    title: `Annunci Sportivi ${label} — Squadre e Tornei | Mondo Sport`,
    description: REGIONE_DESC[regione] || `Annunci sportivi in ${label}.`,
    alternates: { canonical: `https://mondo-sport.vercel.app/regione/${regione}` },
  }
}

export default async function RegionePage({ params, searchParams }: Props) {
  const p = await params
  const sp = await searchParams
  const regione = p.regione.toLowerCase()
  const label = regione.charAt(0).toUpperCase() + regione.slice(1)

  if (!REGIONI_ITALIA.map(r => r.toLowerCase()).includes(regione)) notFound()

  const session = await auth()
  const isGuest = !session?.user
  let isAdmin = false
  if (session?.user) {
    const { getUtente } = await import('@/lib/db')
    const u = await getUtente(session.user.id!)
    isAdmin = u?.tipo === 'admin'
  }

  const filtri = { regione: label, page: Number(sp.page) || 1 }
  const { annunci, total } = await cercaAnnunciV2(filtri, isGuest)

  return (
    <main style={{ background: 'var(--ms-bg)', minHeight: '100vh' }}>
      <div style={{ background: 'var(--ms-green)', padding: '16px 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', margin: 0 }}>
          📍 Annunci Sportivi in {label}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: '6px 0 0' }}>
          {REGIONE_DESC[regione] || `Trova squadre, atleti e tornei in ${label}`}
        </p>
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
  return REGIONI_ITALIA.filter(r => !r.startsWith('—')).map(r => ({ regione: r.toLowerCase() }))
}
