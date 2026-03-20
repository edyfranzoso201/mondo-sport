import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/auth/SessionProvider'
import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AdPopup from '@/components/layout/AdPopup'

export const metadata: Metadata = {
  title: 'Mondo Sport — Cerca nel Mondo dello Sport',
  description: 'Piattaforma gratuita per atleti e società sportive in Italia. Trova squadre, giocatori, allenatori, preparatori atletici. Organizza tornei e amichevoli. Annunci per calcio, calcio a 5, pallavolo, basket, padel, softair.',
  keywords: 'cerco squadra calcio, cerco giocatori calcio, torneo calcio Italia, organizza torneo sportivo, amichevole calcio, cerco amichevole, organizza amichevole, annunci sportivi gratis, preparatore atletico, allenatore calcio, portiere calcio, calcio a 5, pallavolo, basket, padel, softair, società sportiva, staff sportivo, torneo under 12, torneo giovanile, cerca squadra sport',
  authors: [{ name: 'Mondo Sport' }],
  creator: 'Mondo Sport',
  publisher: 'Mondo Sport',
  robots: 'index, follow',
  openGraph: {
    title: 'Mondo Sport — Cerca nel Mondo dello Sport',
    description: 'Trova squadre, giocatori e tornei sportivi in Italia. Gratis per atleti e società.',
    url: 'https://mondo-sport.vercel.app',
    siteName: 'Mondo Sport',
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mondo Sport — Cerca nel Mondo dello Sport',
    description: 'Trova squadre, giocatori e tornei sportivi in Italia.',
  },
  verification: {
    google: 'a3ryeAw1JUmaTgwSjWBG_vsJ1nRH_5fC244vRMv_t30',
  },
  alternates: {
    canonical: 'https://mondo-sport.vercel.app',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Mondo Sport",
              "alternateName": "Cerca nel Mondo dello Sport",
              "url": "https://mondo-sport.vercel.app",
              "description": "Piattaforma gratuita per atleti e società sportive in Italia. Trova squadre, giocatori, allenatori e tornei.",
              "inLanguage": "it-IT",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://mondo-sport.vercel.app/?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Mondo Sport",
              "url": "https://mondo-sport.vercel.app",
              "email": "info.mondo2026@gmail.com",
              "description": "Piattaforma sportiva italiana per atleti e società. Calcio, Calcio a 5, Pallavolo, Basket, Padel, Softair.",
              "areaServed": "Italia",
              "serviceType": ["Annunci sportivi", "Ricerca squadra", "Tornei sportivi", "Partite amichevoli", "Organizzazione tornei", "Ricerca staff tecnico"]
            })
          }}
        />
      </head>
      <body style={{ margin: 0, fontFamily: 'Barlow, sans-serif' }}>
        <SessionProvider session={session}>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <AdPopup />
        </SessionProvider>
      </body>
    </html>
  )
}
