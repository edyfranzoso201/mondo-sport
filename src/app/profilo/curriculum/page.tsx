import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getCurriculum } from '@/lib/db'
import CurriculumClient from './CurriculumClient'

export default async function CurriculumPage() {
  const session = await auth()
  if (!session?.user) redirect('/accedi')
  const curriculum = await getCurriculum(session.user.id!)
  return <CurriculumClient userId={session.user.id!} curriculum={curriculum} />
}
