import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getCurriculum, salvaCurriculum } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import type { CurriculumSportivo } from '@/types'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const curriculum = await getCurriculum(session.user.id!)
  return NextResponse.json({ success: true, data: curriculum })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const body = await req.json()
  const curriculum: CurriculumSportivo = {
    userId: session.user.id!,
    esperienze: (body.esperienze || []).map((e: any) => ({ ...e, id: e.id || uuidv4() })),
    titoli: body.titoli || [],
    qualifiche: body.qualifiche || [],
    altezza: body.altezza || undefined,
    peso: body.peso || undefined,
    piedePredominante: body.piedePredominante || undefined,
    note: body.note || undefined,
    visibile: false,
    updatedAt: new Date().toISOString(),
  }
  await salvaCurriculum(curriculum)
  return NextResponse.json({ success: true, message: 'Curriculum salvato' })
}
