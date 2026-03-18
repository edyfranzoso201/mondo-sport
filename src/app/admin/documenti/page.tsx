import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUtente, getDocumenti } from '@/lib/db'
import DocumentiClient from './DocumentiClient'

export default async function DocumentiPage() {
  const session = await auth()
  if (!session?.user) redirect('/accedi')
  const u = await getUtente(session.user.id!)
  if (u?.tipo !== 'admin') redirect('/')
  const docs = await getDocumenti()
  return <DocumentiClient documentiIniziali={docs} />
}
