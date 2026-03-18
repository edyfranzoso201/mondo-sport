import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUtente, getUtentiApproved, getAlertsUtente, getProfilo } from '@/lib/db'
import { inviaAlertEmail } from '@/lib/email'
import type { AlertConfig, ProfiloPubblico } from '@/types'

// POST /api/admin/notifica-alert
// Chiamata dopo l'approvazione di un utente per notificare chi ha alert matching
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const adminUtente = await getUtente(session.user.id!)
  if (adminUtente?.tipo !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

  const { nuovoUserId } = await req.json()
  const nuovoProfilo = await getProfilo(nuovoUserId)
  if (!nuovoProfilo) return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })

  // Recupera tutti gli utenti approvati con alert attivi
  const approvedIds = await getUtentiApproved()
  let notificati = 0

  for (const utente of approvedIds) {
    if (utente.id === nuovoUserId) continue
    const alerts = await getAlertsUtente(utente.id)
    const matching = alerts.filter((a: AlertConfig) => alertMatches(a, nuovoProfilo))

    if (matching.length > 0) {
      try {
        await inviaAlertEmail(utente.email, utente.alias,
  `${nuovoProfilo.nomeSocieta || nuovoProfilo.alias} - ${nuovoProfilo.sportPrimario} - ${nuovoProfilo.comune}`
)
        notificati++
      } catch (e) {
        console.error(`Alert email non inviata a ${utente.email}:`, e)
      }
    }
  }

  return NextResponse.json({ success: true, notificati })
}

function alertMatches(alert: AlertConfig, profilo: ProfiloPubblico): boolean {
  if (!alert.attivo) return false
  if (alert.sport && !profilo.sport.includes(alert.sport)) return false
  if (alert.ruolo && !profilo.ruoli.includes(alert.ruolo)) return false
  if (alert.regione && profilo.regione !== alert.regione) return false
  if (alert.categoria && !profilo.categoria.includes(alert.categoria)) return false
  if (alert.comune && !profilo.comune.toLowerCase().includes(alert.comune.toLowerCase())) return false
  return true
}
