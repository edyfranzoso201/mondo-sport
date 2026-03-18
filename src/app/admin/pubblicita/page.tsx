import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUtente, getSlotsAd } from '@/lib/db'
import PubblicitaClient from './PubblicitaClient'

export default async function PubblicitaPage() {
  const session = await auth()
  if (!session?.user) redirect('/accedi')
  const utente = await getUtente(session.user.id!)
  if (utente?.tipo !== 'admin') redirect('/')
  const slots = await getSlotsAd()
  return <PubblicitaClient slots={slots} />
}
