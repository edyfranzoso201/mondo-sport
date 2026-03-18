import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUtente, getUtentiPending, getUtentiApproved } from '@/lib/db'
import AdminPanel from './AdminPanel'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user) redirect('/accedi')

  const utente = await getUtente(session.user.id!)
  if (utente?.tipo !== 'admin') redirect('/')

  const pending = await getUtentiPending()
  const approved = await getUtentiApproved()

  return <AdminPanel pending={pending} approved={approved} />
}
