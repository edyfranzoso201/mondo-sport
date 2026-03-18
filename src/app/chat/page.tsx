import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getConversazioniUtente, getProfilo, getUtente } from '@/lib/db'
import ChatPage from './ChatPage'

export default async function ChatRoute() {
  const session = await auth()
  if (!session?.user) redirect('/accedi')

  const conversazioni = await getConversazioniUtente(session.user.id!)

  const convWithProfiles = await Promise.all(
    conversazioni.map(async conv => {
      const altroId = conv.partecipanti.find(p => p !== session.user!.id)
      if (!altroId) return { conv, profilo: null, nonLetti: 0 }

      // Prima prova il profilo pubblico, poi l'utente direttamente
      let profilo = altroId ? await getProfilo(altroId) : null

      // Se il profilo non esiste (es. admin), costruiscilo dall'utente
      if (!profilo) {
        const u = await getUtente(altroId)
        if (u) {
          profilo = {
            id: u.id,
            tipo: u.tipo,
            alias: u.alias,
            annoDiNascita: u.annoDiNascita,
            comune: u.comune,
            regione: u.regione,
            sport: u.sport,
            sportPrimario: u.sportPrimario,
            ruoli: u.ruoli,
            categoria: u.categoria,
            statoAnnuncio: 'nascosto' as const,
            nascondiRuolo: false,
            createdAt: u.createdAt,
          }
        }
      }

      return {
        conv,
        profilo,
        nonLetti: conv.nonLetti[session.user!.id!] || 0,
      }
    })
  )

  return (
    <ChatPage
      userId={session.user.id!}
      userAlias={session.user.name || 'Tu'}
      conversazioni={convWithProfiles}
    />
  )
}
