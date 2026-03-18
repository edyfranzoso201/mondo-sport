import { auth } from '@/lib/auth'
import { getUtente } from '@/lib/db'
import { redirect } from 'next/navigation'
import MappaClient from './MappaClient'

export default async function MappaPage() {
  const session = await auth()
  if (!session?.user) redirect('/accedi')

  const utente = await getUtente(session.user.id!)
  if (!utente) redirect('/')

  // Cerca le coordinate del comune dell'utente
  const comuneUtente = utente.comune
  const regioneUtente = utente.regione

  return (
    <MappaClient
      userId={session.user.id!}
      comuneUtente={comuneUtente}
      regioneUtente={regioneUtente}
    />
  )
}
