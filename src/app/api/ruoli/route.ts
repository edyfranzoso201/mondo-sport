import { NextResponse } from 'next/server'
import { getRuoliPersonalizzati } from '@/lib/db'
import { RUOLI_PER_SPORT } from '@/types'

export async function GET() {
  const personalizzati = await getRuoliPersonalizzati()
  const ruoli = personalizzati || RUOLI_PER_SPORT
  return NextResponse.json({ ruoli })
}
