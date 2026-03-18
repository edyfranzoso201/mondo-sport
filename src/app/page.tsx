import { auth } from '@/lib/auth'
import { cercaAnnunciV2 } from '@/lib/db'
import AnnunciListV2 from '@/components/annunci/AnnunciListV2'
import FiltriBarV2 from '@/components/annunci/FiltriBarV2'
import HeroSection from '@/components/layout/HeroSection'
import DocumentiWidget from '@/components/layout/DocumentiWidget'
import SidebarAd from '@/components/layout/SidebarAd'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await auth()
  const isGuest = !session?.user
  const params = await searchParams

  const filtri = {
    sport: params.sport,
    ruolo: params.ruolo,
    regione: params.regione,
    comune: params.comune,
    categoria: params.categoria,
    tipo: params.tipo,
    livello: params.livello,
    page: Number(params.page) || 1,
    limit: 20,
  }

  // Comune utente loggato (per filtro km)
  let comuneUtente = ''
  if (session?.user) {
    const { getUtente } = await import('@/lib/db')
    const u = await getUtente(session.user.id!)
    comuneUtente = u?.comune || ''
  }

  const { annunci, total } = await cercaAnnunciV2(filtri, isGuest)

  return (
    <main className="min-h-screen" style={{ background: 'var(--ms-bg)' }}>
      {isGuest && <HeroSection />}
      <FiltriBarV2 filtriAttivi={filtri} comuneUtente={comuneUtente} />
      <div className="ms-layout">
        <SidebarAd position="left" />
        <div className="ms-content">
          <DocumentiWidget />
        <AnnunciListV2
            annunci={annunci}
            total={total}
            isGuest={isGuest}
            filtriAttivi={filtri}
            page={filtri.page}
          />
        </div>
        <SidebarAd position="right" />
      </div>
    </main>
  )
}
