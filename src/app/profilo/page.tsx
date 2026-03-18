import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUtente, getAlertsUtente } from '@/lib/db'
import ProfiloClient from './ProfiloClient'

export default async function ProfiloPage() {
  const session = await auth()
  if (!session?.user) redirect('/accedi')

  const utente = await getUtente(session.user.id!)
  if (!utente) redirect('/accedi')

  const alerts = await getAlertsUtente(utente.id)

  // Rimuovi dati sensibili prima di passare al client
  const { passwordHash, ...utentePublic } = utente as any

  return <ProfiloClient utente={utentePublic} alerts={alerts} />
}
