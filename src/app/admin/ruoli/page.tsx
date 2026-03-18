import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUtente, getRuoliPersonalizzati } from '@/lib/db'
import { RUOLI_PER_SPORT, SPORT_LABELS } from '@/types'
import RuoliClient from './RuoliClient'

export default async function RuoliPage() {
  const session = await auth()
  if (!session?.user) redirect('/accedi')
  const u = await getUtente(session.user.id!)
  if (u?.tipo !== 'admin') redirect('/')

  const personalizzati = await getRuoliPersonalizzati()
  const ruoliAttuali = personalizzati || { ...RUOLI_PER_SPORT }

  return <RuoliClient ruoliAttuali={ruoliAttuali} sportLabels={SPORT_LABELS} />
}
