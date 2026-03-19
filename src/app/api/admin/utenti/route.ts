import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getUtentiPending, approvaUtente, rifiutaUtente,
  getUtente, getUtentiApproved, getAlertsUtente, getProfilo, redis,
} from '@/lib/db'
import { inviaEmailApprovazione, inviaAlertEmail } from '@/lib/email'
import type { AlertConfig, ProfiloPubblico, Utente } from '@/types'

async function checkAdmin(req: NextRequest): Promise<Utente | null> {
  const session = await auth()
  if (!session?.user) return null
  const utente = await getUtente(session.user.id!)
  if (utente?.tipo !== 'admin') return null
  return utente
}

export async function GET(req: NextRequest) {
  const admin = await checkAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  if (searchParams.get('stato') === 'approved') {
    const utenti = await getUtentiApproved()
    return NextResponse.json({ success: true, data: utenti })
  }
  const utenti = await getUtentiPending()
  return NextResponse.json({ success: true, data: utenti })
}

export async function POST(req: NextRequest) {
  const admin = await checkAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const { userId, azione } = await req.json()
  if (!userId || !['approva', 'rifiuta'].includes(azione)) {
    return NextResponse.json({ error: 'Parametri non validi' }, { status: 400 })
  }
  const utente = await getUtente(userId)
  if (!utente) return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })

  if (azione === 'approva') {
    await approvaUtente(userId)
    try { await inviaEmailApprovazione(utente.email, utente.alias) } catch {}
    // Notifica alert
    try {
      const nuovoProfilo = await getProfilo(userId)
      if (nuovoProfilo) {
        const approvati = await getUtentiApproved()
        for (const u of approvati) {
          if (u.id === userId) continue
          const alerts = await getAlertsUtente(u.id)
          const match = alerts.some((a: AlertConfig) => alertMatches(a, nuovoProfilo))
          if (match) {
            try {
              await inviaAlertEmail(u.email, u.alias, `${nuovoProfilo.nomeSocieta || nuovoProfilo.alias} - ${nuovoProfilo.sportPrimario} - ${nuovoProfilo.comune}`)
            } catch {}
          }
        }
      }
    } catch {}
  } else {
    await rifiutaUtente(userId)
  }
  return NextResponse.json({ success: true, message: `Utente ${azione === 'approva' ? 'approvato' : 'rifiutato'}` })
}

function alertMatches(alert: AlertConfig, p: ProfiloPubblico): boolean {
  if (!alert.attivo) return false
  if (alert.sport && !p.sport.includes(alert.sport)) return false
  if (alert.ruolo && !p.ruoli.includes(alert.ruolo)) return false
  if (alert.regione && p.regione !== alert.regione) return false
  if (alert.categoria && !p.categoria.includes(alert.categoria)) return false
  return true
}

export async function DELETE(req: NextRequest) {
  const admin = await checkAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId mancante' }, { status: 400 })

  const utente = await getUtente(userId)
  if (!utente) return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })

  // ── Elimina tutti gli annunci dell'utente ─────────────────────────────────
  const annunciIds = await redis.smembers(`user:annunci:${userId}`) as string[]
  for (const annId of annunciIds) {
    const raw = await redis.get(`annuncio:${annId}`) as any
    if (raw) {
      const ann = typeof raw === 'string' ? JSON.parse(raw) : raw
      const p = redis.pipeline()
      p.del(`annuncio:${annId}`)
      p.srem(`ann:sport:${ann.sport}`, annId)
      p.srem(`ann:regione:${(ann.regione || '').toLowerCase()}`, annId)
      p.srem(`ann:tipo:${ann.tipo}`, annId)
      p.zrem('annunci:recenti:v2', annId)
      await p.exec()
    }
  }

  // Remove from all sets and delete all keys
  const pipe = redis.pipeline()
  pipe.srem('users:pending', userId)
  pipe.srem('users:approved', userId)
  pipe.del(`user:${userId}`)
  pipe.del(`profile:${userId}`)
  pipe.del(`user:email:${utente.email.toLowerCase()}`)
  pipe.del(`user:alias:${utente.alias.toLowerCase()}`)
  pipe.del(`alerts:${userId}`)
  pipe.del(`user:convs:${userId}`)
  pipe.del(`curriculum:${userId}`)
  pipe.del(`user:annunci:${userId}`)
  // Remove from sport/region/role indexes
  utente.sport.forEach((s: string) => pipe.srem(`idx:sport:${s}`, userId))
  pipe.srem(`idx:regione:${utente.regione.toLowerCase()}`, userId)
  utente.ruoli.forEach((r: string) => pipe.srem(`idx:ruolo:${r.toLowerCase()}`, userId))
  utente.categoria.forEach((c: string) => pipe.srem(`idx:cat:${c.toLowerCase()}`, userId))
  await pipe.exec()

  return NextResponse.json({ success: true, message: `Utente ${utente.alias} eliminato con ${annunciIds.length} annunci` })
}
