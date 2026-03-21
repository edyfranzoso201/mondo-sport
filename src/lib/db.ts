import { Redis } from '@upstash/redis'
import type { Utente, ProfiloPubblico, Messaggio, Conversazione, AlertConfig, FiltriRicerca } from '@/types'

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// ─── Keys ─────────────────────────────────────────────────────────────────────
const K = {
  utente: (id: string) => `user:${id}`,
  utenteByEmail: (email: string) => `user:email:${email.toLowerCase()}`,
  utenteByAlias: (alias: string) => `user:alias:${alias.toLowerCase()}`,
  utentiPending: 'users:pending',
  utentiApproved: 'users:approved',
  profilo: (id: string) => `profile:${id}`,
  idxSport: (s: string) => `idx:sport:${s}`,
  idxRegione: (r: string) => `idx:regione:${r.toLowerCase()}`,
  idxRuolo: (r: string) => `idx:ruolo:${r.toLowerCase()}`,
  idxCategoria: (c: string) => `idx:cat:${c.toLowerCase()}`,
  conversazione: (id: string) => `conv:${id}`,
  convByUsers: (u1: string, u2: string) => `conv:users:${[u1, u2].sort().join(':')}`,
  messaggi: (convId: string) => `msgs:${convId}`,
  userConvs: (uid: string) => `user:convs:${uid}`,
  userAlerts: (uid: string) => `alerts:${uid}`,
  verifyToken: (t: string) => `verify:${t}`,
}

// ─── Utenti ───────────────────────────────────────────────────────────────────
export function estraiProfiloPubblico(utente: Utente): ProfiloPubblico {
  const base: ProfiloPubblico = {
    id: utente.id,
    tipo: utente.tipo,
    alias: utente.alias,
    annoDiNascita: utente.annoDiNascita,
    comune: utente.comune,
    regione: utente.regione,
    sport: utente.sport,
    sportPrimario: utente.sportPrimario,
    ruoli: utente.ruoli,
    categoria: utente.categoria,
    statoAnnuncio: utente.statoAnnuncio,
    nascondiRuolo: utente.nascondiRuolo || false,
    descrizione: (utente as any).descrizione || undefined,
    createdAt: utente.createdAt,
  }
  if (utente.tipo === 'societa') {
    const soc = utente as any
    if (soc.mostraNomeSocieta) base.nomeSocieta = soc.nomeSocieta
  }
  return base
}

export async function creaUtente(utente: Utente): Promise<void> {
  const pipe = redis.pipeline()
  pipe.set(K.utente(utente.id), JSON.stringify(utente))
  pipe.set(K.utenteByEmail(utente.email), utente.id)
  pipe.set(K.utenteByAlias(utente.alias), utente.id)
  pipe.sadd(K.utentiPending, utente.id)
  pipe.set(K.profilo(utente.id), JSON.stringify(estraiProfiloPubblico(utente)))
  await pipe.exec()
}

export async function getUtente(id: string): Promise<Utente | null> {
  const data = await redis.get(K.utente(id))
  if (!data) return null
  return (typeof data === 'string' ? JSON.parse(data) : data) as Utente
}

export async function getUtenteByEmail(email: string): Promise<Utente | null> {
  const id = await redis.get<string>(K.utenteByEmail(email))
  if (!id) return null
  return getUtente(id)
}

export async function aliasDisponibile(alias: string): Promise<boolean> {
  const id = await redis.get(K.utenteByAlias(alias))
  return !id
}

export async function aggiornaUtente(id: string, updates: Partial<Utente>): Promise<void> {
  const utente = await getUtente(id)
  if (!utente) throw new Error('Utente non trovato')
  const updated = { ...utente, ...updates, updatedAt: new Date().toISOString() } as Utente
  const pipe = redis.pipeline()
  pipe.set(K.utente(id), JSON.stringify(updated))
  pipe.set(K.profilo(id), JSON.stringify(estraiProfiloPubblico(updated)))
  await pipe.exec()
}

export async function approvaUtente(id: string): Promise<void> {
  const utente = await getUtente(id)
  if (!utente) return
  const pipe = redis.pipeline()
  pipe.srem(K.utentiPending, id)
  pipe.sadd(K.utentiApproved, id)
  utente.sport.forEach(s => pipe.sadd(K.idxSport(s), id))
  pipe.sadd(K.idxRegione(utente.regione), id)
  utente.ruoli.forEach(r => pipe.sadd(K.idxRuolo(r.toLowerCase()), id))
  utente.categoria.forEach(c => pipe.sadd(K.idxCategoria(c.toLowerCase()), id))
  pipe.set(K.utente(id), JSON.stringify({ ...utente, stato: 'approved', updatedAt: new Date().toISOString() }))
  await pipe.exec()
}

export async function rifiutaUtente(id: string): Promise<void> {
  const utente = await getUtente(id)
  const pipe = redis.pipeline()
  pipe.srem(K.utentiPending, id)
  pipe.srem(K.utentiApproved, id)
  pipe.del(`user:${id}`)
  pipe.del(`profile:${id}`)
  if (utente) {
    pipe.del(`user:email:${utente.email.toLowerCase()}`)
    pipe.del(`user:alias:${utente.alias.toLowerCase()}`)
    pipe.del(`alerts:${id}`)
    pipe.del(`user:convs:${id}`)
    pipe.del(`curriculum:${id}`)
    pipe.del(`user:annunci:${id}`)
  }
  await pipe.exec()
}

export async function getUtentiPending(): Promise<Utente[]> {
  const ids = await redis.smembers(K.utentiPending)
  if (!ids.length) return []
  const utenti = await Promise.all(ids.map(id => getUtente(id)))
  return utenti.filter(Boolean) as Utente[]
}

export async function getUtentiApproved(): Promise<Utente[]> {
  const ids = await redis.smembers(K.utentiApproved)
  if (!ids.length) return []
  const utenti = await Promise.all(ids.map(id => getUtente(id)))
  return utenti.filter(Boolean) as Utente[]
}

// ─── Profili ──────────────────────────────────────────────────────────────────
export async function getProfilo(id: string): Promise<ProfiloPubblico | null> {
  const data = await redis.get(K.profilo(id))
  if (!data) return null
  return (typeof data === 'string' ? JSON.parse(data) : data) as ProfiloPubblico
}

export async function cercaAnnunci(
  filtri: FiltriRicerca,
  isGuest = false
): Promise<{ profili: ProfiloPubblico[]; total: number }> {
  const limit = filtri.limit || 20
  const page = filtri.page || 1

  let candidati: string[]
  if (filtri.sport) {
    candidati = await redis.smembers(K.idxSport(filtri.sport))
  } else {
    candidati = await redis.smembers(K.utentiApproved)
  }

  if (!candidati.length) return { profili: [], total: 0 }

  if (filtri.regione) {
    const set = await redis.smembers(K.idxRegione(filtri.regione))
    candidati = candidati.filter(id => set.includes(id))
  }
  if (filtri.ruolo) {
    const set = await redis.smembers(K.idxRuolo(filtri.ruolo.toLowerCase()))
    candidati = candidati.filter(id => set.includes(id))
  }
  if (filtri.categoria) {
    const set = await redis.smembers(K.idxCategoria(filtri.categoria.toLowerCase()))
    candidati = candidati.filter(id => set.includes(id))
  }

  const profili = await Promise.all(candidati.map(id => getProfilo(id)))
  let risultati = (profili.filter(Boolean) as ProfiloPubblico[])
    .filter(p => p.statoAnnuncio !== 'nascosto')

  if (filtri.statoAnnuncio) risultati = risultati.filter(p => p.statoAnnuncio === filtri.statoAnnuncio)
  if (filtri.tipo) risultati = risultati.filter(p => p.tipo === filtri.tipo)
  if (filtri.comune) {
    const q = filtri.comune.toLowerCase()
    risultati = risultati.filter(p => p.comune.toLowerCase().includes(q))
  }

  risultati.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const total = risultati.length
  const start = (page - 1) * limit
  return { profili: risultati.slice(start, start + limit), total }
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export async function creaOGetConversazione(u1: string, u2: string): Promise<Conversazione> {
  const existingId = await redis.get<string>(K.convByUsers(u1, u2))
  if (existingId) {
    const d = await redis.get(K.conversazione(existingId))
    if (d) return (typeof d === 'string' ? JSON.parse(d) : d) as Conversazione
  }
  const { v4: uuidv4 } = await import('uuid')
  const id = uuidv4()
  const conv: Conversazione = {
    id,
    partecipanti: [u1, u2],
    ultimaAttivita: new Date().toISOString(),
    nonLetti: { [u1]: 0, [u2]: 0 },
  }
  const pipe = redis.pipeline()
  pipe.set(K.conversazione(id), JSON.stringify(conv))
  pipe.set(K.convByUsers(u1, u2), id)
  pipe.sadd(K.userConvs(u1), id)
  pipe.sadd(K.userConvs(u2), id)
  await pipe.exec()
  return conv
}

export async function inviaMessaggio(convId: string, mittente: string, testo: string): Promise<Messaggio> {
  const { v4: uuidv4 } = await import('uuid')
  const msg: Messaggio = {
    id: uuidv4(),
    conversazioneId: convId,
    mittente,
    testo,
    timestamp: new Date().toISOString(),
    letto: false,
  }
  const raw = await redis.get(K.conversazione(convId))
  if (!raw) throw new Error('Conversazione non trovata')
  const conv = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Conversazione
  conv.partecipanti.filter(p => p !== mittente).forEach(u => {
    conv.nonLetti[u] = (conv.nonLetti[u] || 0) + 1
  })
  conv.ultimoMessaggio = testo.slice(0, 100)
  conv.ultimaAttivita = msg.timestamp
  const pipe = redis.pipeline()
  pipe.lpush(K.messaggi(convId), JSON.stringify(msg))
  pipe.ltrim(K.messaggi(convId), 0, 19) // mantieni solo gli ultimi 20 messaggi
  pipe.set(K.conversazione(convId), JSON.stringify(conv))
  await pipe.exec()
  return msg
}

export async function getMessaggi(convId: string, limit = 20): Promise<Messaggio[]> {
  const data = await redis.lrange(K.messaggi(convId), 0, limit - 1)
  return (data as string[]).map(d => typeof d === 'string' ? JSON.parse(d) : d).reverse()
}

export async function getConversazioniUtente(userId: string): Promise<Conversazione[]> {
  const ids = await redis.smembers(K.userConvs(userId))
  if (!ids.length) return []
  const convs = await Promise.all(ids.map(id => redis.get(K.conversazione(id))))
  return (convs.filter(Boolean) as string[])
    .map(d => typeof d === 'string' ? JSON.parse(d) : d as Conversazione)
    .sort((a, b) => new Date(b.ultimaAttivita).getTime() - new Date(a.ultimaAttivita).getTime())
}

// ─── Alert ────────────────────────────────────────────────────────────────────
export async function salvaAlert(alert: AlertConfig): Promise<void> {
  const alerts = await getAlertsUtente(alert.userId)
  const updated = [...alerts.filter(a => a.id !== alert.id), alert]
  await redis.set(K.userAlerts(alert.userId), JSON.stringify(updated))
}

export async function getAlertsUtente(userId: string): Promise<AlertConfig[]> {
  const data = await redis.get(K.userAlerts(userId))
  if (!data) return []
  return (typeof data === 'string' ? JSON.parse(data) : data) as AlertConfig[]
}

// ─── Token ────────────────────────────────────────────────────────────────────
export async function salvaToken(token: string, userId: string, ttl = 86400): Promise<void> {
  await redis.set(K.verifyToken(token), userId, { ex: ttl })
}

export async function verificaToken(token: string): Promise<string | null> {
  const userId = await redis.get<string>(K.verifyToken(token))
  if (userId) await redis.del(K.verifyToken(token))
  return userId
}

// ─── Curriculum sportivo ──────────────────────────────────────────────────────
import type { CurriculumSportivo } from '@/types'

const K_curriculum = (userId: string) => `curriculum:${userId}`

export async function getCurriculum(userId: string): Promise<CurriculumSportivo | null> {
  const data = await redis.get(K_curriculum(userId))
  if (!data) return null
  return (typeof data === 'string' ? JSON.parse(data) : data) as CurriculumSportivo
}

export async function salvaCurriculum(curriculum: CurriculumSportivo): Promise<void> {
  await redis.set(K_curriculum(curriculum.userId), JSON.stringify({
    ...curriculum,
    updatedAt: new Date().toISOString(),
  }))
}

// ─── Pubblicità ───────────────────────────────────────────────────────────────
import type { SlotAd } from '@/types'

const SLOT_IDS = ['left-1', 'left-2', 'right-1', 'right-2']

export async function getSlotsAd(): Promise<SlotAd[]> {
  const results = await Promise.all(
    SLOT_IDS.map(async id => {
      const raw = await redis.get(`ad:slot:${id}`)
      if (!raw) {
        return {
          id, tipo: 'vuoto' as const, attivo: false,
          updatedAt: new Date().toISOString()
        }
      }
      return (typeof raw === 'string' ? JSON.parse(raw) : raw) as SlotAd
    })
  )
  return results
}

export async function getSlotAd(id: string): Promise<SlotAd | null> {
  const raw = await redis.get(`ad:slot:${id}`)
  if (!raw) return null
  return (typeof raw === 'string' ? JSON.parse(raw) : raw) as SlotAd
}

export async function salvaSlotAd(slot: SlotAd): Promise<void> {
  await redis.set(`ad:slot:${slot.id}`, JSON.stringify({
    ...slot,
    updatedAt: new Date().toISOString(),
  }))
}

import { getCoords, distanzaKm } from '@/lib/comuni'

// ─── Annunci multipli ─────────────────────────────────────────────────────────
import type { Annuncio, AnnuncioConProfilo, TipoAnnuncio, Sport as SportType } from '@/types'

const Ka = {
  annuncio: (id: string) => `annuncio:${id}`,
  userAnnunci: (userId: string) => `user:annunci:${userId}`,
  idxSportAnn: (s: string) => `ann:sport:${s}`,
  idxRegioneAnn: (r: string) => `ann:regione:${r.toLowerCase()}`,
  idxTipoAnn: (t: string) => `ann:tipo:${t}`,
  annunciRecenti: 'annunci:recenti:v2',
}

export async function creaAnnuncio(ann: Annuncio): Promise<void> {
  const pipe = redis.pipeline()
  pipe.set(Ka.annuncio(ann.id), JSON.stringify(ann))
  pipe.sadd(Ka.userAnnunci(ann.userId), ann.id)
  pipe.sadd(Ka.idxSportAnn(ann.sport), ann.id)
  pipe.sadd(Ka.idxRegioneAnn(ann.regione), ann.id)
  pipe.sadd(Ka.idxTipoAnn(ann.tipo), ann.id)
  // Sorted set per ordine temporale (bumpedAt = score)
  pipe.zadd(Ka.annunciRecenti, { score: new Date(ann.bumpedAt).getTime(), member: ann.id })
  await pipe.exec()
}

export async function aggiornaAnnuncio(id: string, updates: Partial<Annuncio>): Promise<Annuncio | null> {
  const raw = await redis.get(Ka.annuncio(id))
  if (!raw) return null
  const ann = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Annuncio
  const updated = { ...ann, ...updates, updatedAt: new Date().toISOString() }
  const pipe = redis.pipeline()
  pipe.set(Ka.annuncio(id), JSON.stringify(updated))
  if (updates.bumpedAt) {
    pipe.zadd(Ka.annunciRecenti, { score: new Date(updates.bumpedAt).getTime(), member: id })
  }
  await pipe.exec()
  return updated
}

export async function eliminaAnnuncio(id: string, userId: string): Promise<void> {
  const raw = await redis.get(Ka.annuncio(id))
  if (!raw) return
  const ann = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Annuncio
  const pipe = redis.pipeline()
  pipe.del(Ka.annuncio(id))
  pipe.srem(Ka.userAnnunci(userId), id)
  pipe.srem(Ka.idxSportAnn(ann.sport), id)
  pipe.srem(Ka.idxRegioneAnn(ann.regione), id)
  pipe.srem(Ka.idxTipoAnn(ann.tipo), id)
  pipe.zrem(Ka.annunciRecenti, id)
  await pipe.exec()
}

export async function getAnnunciUtente(userId: string): Promise<Annuncio[]> {
  const ids = await redis.smembers(Ka.userAnnunci(userId))
  if (!ids.length) return []
  const annunci = await Promise.all(ids.map(async id => {
    const raw = await redis.get(Ka.annuncio(id))
    if (!raw) return null
    return (typeof raw === 'string' ? JSON.parse(raw) : raw) as Annuncio
  }))
  return (annunci.filter(Boolean) as Annuncio[])
    .sort((a, b) => new Date(b.bumpedAt).getTime() - new Date(a.bumpedAt).getTime())
}

export interface FiltriAnnunci {
  sport?: string; ruolo?: string; regione?: string
  comune?: string; categoria?: string; tipo?: string
  soloAttivi?: boolean; kmMax?: number; comuneRicerca?: string; page?: number; limit?: number
}

export async function cercaAnnunciV2(
  filtri: FiltriAnnunci,
  isGuest = false
): Promise<{ annunci: AnnuncioConProfilo[]; total: number }> {
  const limit = filtri.limit || 20
  const page = filtri.page || 1

  // Recupera tutti gli ID in ordine (più recenti prima)
  const allIds = await redis.zrange(Ka.annunciRecenti, 0, -1, { rev: true })
  if (!allIds.length) return { annunci: [], total: 0 }

  const annunci: Annuncio[] = []
  for (const id of allIds) {
    const raw = await redis.get(Ka.annuncio(id as string))
    if (!raw) continue
    const ann = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Annuncio
    if (!ann.attivo) continue

    // Filtri
    if (filtri.sport && ann.sport !== filtri.sport) continue
    if (filtri.regione && ann.regione !== filtri.regione) continue
    if (filtri.comune && !ann.comune.toLowerCase().includes(filtri.comune.toLowerCase())) continue
    if (filtri.ruolo && !ann.ruoli.includes(filtri.ruolo)) continue
    if (filtri.categoria && !ann.categoria.includes(filtri.categoria)) continue
    if (filtri.tipo && ann.tipo !== filtri.tipo) continue
    if (filtri.soloAttivi && (!ann.attivo || ann.chiuso)) continue
    // Filtro km: calcola distanza reale tra comune dell'annuncio e comune di ricerca
    if (filtri.kmMax && filtri.comuneRicerca) {
      const coordsRicerca = getCoords(filtri.comuneRicerca)
      const coordsAnnuncio = getCoords(ann.comune)
      if (coordsRicerca && coordsAnnuncio) {
        const dist = distanzaKm(coordsRicerca[0], coordsRicerca[1], coordsAnnuncio[0], coordsAnnuncio[1])
        if (dist > filtri.kmMax) continue
      }
      // Se non troviamo le coordinate del comune dell'annuncio, lo includiamo
    }


    annunci.push(ann)
  }

  const total = annunci.length
  const slice = annunci.slice((page - 1) * limit, page * limit)

  // Aggiungi profili autori
  const result: AnnuncioConProfilo[] = await Promise.all(
    slice.map(async ann => {
      const profilo = await getProfilo(ann.userId)
      return {
        ...ann,
        autore: profilo || {
          id: ann.userId, tipo: 'atleta' as const, alias: 'Utente',
          annoDiNascita: 0, comune: ann.comune, regione: ann.regione,
          sport: [ann.sport], sportPrimario: ann.sport,
          ruoli: ann.ruoli, categoria: ann.categoria,
          statoAnnuncio: 'disponibile' as const,
          nascondiRuolo: false, createdAt: ann.createdAt,
        },
      }
    })
  )

  return { annunci: result, total }
}

// ─── Gestione Ruoli Personalizzati (admin) ────────────────────────────────────
export async function getRuoliPersonalizzati(): Promise<Record<string, string[]> | null> {
  const raw = await redis.get('config:ruoli')
  if (!raw) return null
  return (typeof raw === 'string' ? JSON.parse(raw) : raw) as Record<string, string[]>
}

export async function salvaRuoliPersonalizzati(ruoli: Record<string, string[]>): Promise<void> {
  await redis.set('config:ruoli', JSON.stringify(ruoli))
}

// ─── Gestione Documenti (PDF/link) ───────────────────────────────────────────
export interface Documento {
  id: string
  titolo: string
  descrizione?: string
  url: string        // link Google Drive / Dropbox / qualsiasi URL
  tipo: 'pdf' | 'link' | 'altro'
  icona?: string     // emoji opzionale
  visibile: boolean
  createdAt: string
  updatedAt: string
}

export async function getDocumenti(): Promise<Documento[]> {
  const raw = await redis.get('config:documenti')
  if (!raw) return []
  return (typeof raw === 'string' ? JSON.parse(raw) : raw) as Documento[]
}

export async function salvaDocumenti(docs: Documento[]): Promise<void> {
  await redis.set('config:documenti', JSON.stringify(docs))
}
