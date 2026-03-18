import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAnnunciUtente } from '@/lib/db'
import MieiAnnunciClient from './MieiAnnunciClient'

export default async function MieiAnnunciPage() {
  const session = await auth()
  if (!session?.user) redirect('/accedi')
  const annunci = await getAnnunciUtente(session.user.id!)
  return <MieiAnnunciClient annunci={annunci} />
}
