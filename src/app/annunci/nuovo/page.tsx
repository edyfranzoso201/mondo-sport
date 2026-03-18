import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NuovoAnnuncioClient from './NuovoAnnuncioClient'

export default async function NuovoAnnuncioPage() {
  const session = await auth()
  if (!session?.user) redirect('/accedi')
  return <NuovoAnnuncioClient userId={session.user.id!} userTipo={(session.user as any).tipo} />
}
