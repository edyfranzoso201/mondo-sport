import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SportBackground from '@/components/layout/SportBackground'
import SessionProvider from '@/components/auth/SessionProvider'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Mondo Sport — Cerca nel Mondo dello Sport',
  description: 'Cerca nel Mondo dello Sport — La piattaforma gratuita per atleti e società sportive. Trova giocatori, allenatori, preparatori atletici. Calcio, Calcio a 5, Pallavolo, Basket, Padel.',
  keywords: 'sport, calcio, calcio a 5, pallavolo, basket, padel, softair, squadra, atleti, allenatori, annunci sportivi, tornei, amichevoli',
  verification: {
    google: 'a3ryeAw1JUmaTgwSjWBG_vsJ1nRH_5fC244vRMv_t30',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="it">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <SessionProvider session={session}>
          <SportBackground />
          <Navbar />
          <div style={{ flex: 1 }}>
            {children}
          </div>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
