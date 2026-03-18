import { NextResponse } from 'next/server'
import { getDocumenti } from '@/lib/db'

export async function GET() {
  const docs = await getDocumenti()
  return NextResponse.json({ success: true, data: docs.filter(d => d.visibile) })
}
