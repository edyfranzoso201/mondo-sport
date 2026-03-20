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
  piemonte: 'Annunci sportivi in Piemonte: trova squadre, atleti e tornei a Torino, Grugliasco, Collegno, Rivoli e in tutta la regione.',
  toscana: 'Annunci sportivi in Toscana: trova squadre, atleti e tornei a Firenze, Prato, Livorno e in tutta la regione.',
  lombardia: 'Annunci sportivi in Lombardia: trova squadre, atleti e tornei a Milano, Brescia, Bergamo e in tutta la regione.',
}

const REGIONE_CITTA: Record<string, string> = {
  piemonte: 'Torino, Grugliasco, Collegno, Rivoli, Nichelino, Moncalieri',
  toscana: 'Firenze, Prato, Livorno, Siena, Arezzo, Lucca',
  lombardia: 'Milano, Brescia, Bergamo, Monza, Como, Varese',
}

export async function generateMetadata({ params }: { params: { regione: string } }): Promise<Metadata> {
  const regione = params.regione.toLowerCase()
  const label = regione.charAt(0).toUpperCase() + regione.slice(1)
  if (!REGIONI_ITALIA.map(r => r.toLowerCase()).includes(regione)) return { title: 'Non trovato' }
  return {
    title: `Annunci Sportivi ${label} — Squadre, Atleti e Tornei | Mondo Sport`,
    description: REGIONE_DESC[regione] || `Annunci sportivi in ${label}. Trova squadre, atleti e organizza tornei su Mondo Sport.`,
    keywords: `annunci sportivi ${label}, cerco squadra ${label}, tornei ${label}, sport ${label}, ${REGIONE_CITTA[regione] || ''}`,
    alternates: { canonical: `https://mondo-sport.vercel.app/annunci/${regione}` },
  }
}

export default async function RegionePage({ params, searchParams }: {
  params: { regione: string }
  searchParams: Record<string, string>
}) {
  const regione = params.regione.toLowerCase()
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

  const filtri = { regione: label, page: Number(searchParams.page) || 1 }
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
        {REGIONE_CITTA[regione] && (
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: '4px 0 0' }}>
            {REGIONE_CITTA[regione]}
          </p>
        )}
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
  return REGIONI_ITALIA
    .filter(r => !r.startsWith('—'))
    .map(r => ({ regione: r.toLowerCase() }))
}
