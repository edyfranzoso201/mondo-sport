import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUtente } from '@/lib/db'
import CreaAnnuncioAdminClient from './CreaAnnuncioAdminClient'

export default async function CreaAnnuncioAdminPage() {
  const session = await auth()
  if (!session?.user) redirect('/accedi')
  const u = await getUtente(session.user.id!)
  if (u?.tipo !== 'admin') redirect('/')
  return <CreaAnnuncioAdminClient adminId={session.user.id!} />
}
