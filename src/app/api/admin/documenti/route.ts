import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUtente, getDocumenti, salvaDocumenti } from '@/lib/db'
import type { Documento } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

async function isAdmin(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return false
  const u = await getUtente(session.user.id!)
  return u?.tipo === 'admin'
}

export async function GET() {
  const docs = await getDocumenti()
  return NextResponse.json({ success: true, data: docs })
}

export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

  const body = await req.json()

  // Aggiunta nuovo documento
  if (body.action === 'add') {
    if (!body.titolo?.trim() || !body.url?.trim()) {
      return NextResponse.json({ error: 'Titolo e URL obbligatori' }, { status: 400 })
    }
    const docs = await getDocumenti()
    const now = new Date().toISOString()
    const doc: Documento = {
      id: uuidv4(),
      titolo: body.titolo.trim(),
      descrizione: body.descrizione?.trim() || undefined,
      url: body.url.trim(),
      tipo: body.tipo || 'pdf',
      icona: body.icona || '📄',
      visibile: body.visibile !== false,
      createdAt: now,
      updatedAt: now,
    }
    docs.push(doc)
    await salvaDocumenti(docs)
    return NextResponse.json({ success: true, data: doc })
  }

  // Aggiorna documento esistente
  if (body.action === 'update') {
    const docs = await getDocumenti()
    const idx = docs.findIndex(d => d.id === body.id)
    if (idx === -1) return NextResponse.json({ error: 'Non trovato' }, { status: 404 })
    docs[idx] = { ...docs[idx], ...body, updatedAt: new Date().toISOString() }
    await salvaDocumenti(docs)
    return NextResponse.json({ success: true, data: docs[idx] })
  }

  // Elimina documento
  if (body.action === 'delete') {
    const docs = await getDocumenti()
    const nuovi = docs.filter(d => d.id !== body.id)
    await salvaDocumenti(nuovi)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Azione non valida' }, { status: 400 })
}
