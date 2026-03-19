'use client'
import React from 'react'
import { useState } from 'react'
import { Check, X, User, Building2, UserCog, ChevronDown, ChevronUp, Clock, Users, Search, Trash2, Shield, Layout, RefreshCw } from 'lucide-react'
import type { Utente } from '@/types'
import { SPORT_LABELS } from '@/types'
import type { Sport } from '@/types'

interface AdminPanelProps {
  pending: Utente[]
  approved: Utente[]
}

export default function AdminPanel({ pending: initialPending, approved: initialApproved }: AdminPanelProps) {
  const [pending, setPending] = useState(initialPending)
  const [approved, setApproved] = useState(initialApproved)
  const [tab, setTab] = useState<'pending' | 'approved'>('pending')
  const [loading, setLoading] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [tabPrincipale, setTabPrincipale] = useState<'utenti' | 'conversazioni'>('utenti')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const azione = async (userId: string, tipo: 'approva' | 'rifiuta') => {
    setLoading(userId)
    const res = await fetch('/api/admin/utenti', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, azione: tipo }),
    })
    if (res.ok) {
      const u = pending.find(u => u.id === userId)
      setPending(p => p.filter(u => u.id !== userId))
      if (tipo === 'approva' && u) setApproved(a => [u, ...a])
    }
    setLoading(null)
  }

  const eliminaUtente = async (userId: string) => {
    setLoading(userId)
    const res = await fetch('/api/admin/utenti', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) {
      setApproved(a => a.filter(u => u.id !== userId))
      setPending(p => p.filter(u => u.id !== userId))
    }
    setConfirmDelete(null)
    setLoading(null)
  }

  const tipoIcon = (tipo: string) => {
    if (tipo === 'societa') return <Building2 size={16} />
    if (tipo === 'staff') return <UserCog size={16} />
    return <User size={16} />
  }

  const filtra = (lista: Utente[]) => {
    if (!search.trim()) return lista
    const q = search.toLowerCase()
    return lista.filter(u =>
      u.alias.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.nome?.toLowerCase().includes(q) ||
      u.cognome?.toLowerCase().includes(q) ||
      u.comune?.toLowerCase().includes(q)
    )
  }

  const lista = filtra(tab === 'pending' ? pending : approved)

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Shield size={24} style={{ color: 'var(--ms-green)' }} />
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 700, margin: 0 }}>
          Pannello Amministratore
        </h1>
        {pending.length > 0 && (
          <span style={{ background: '#dc2626', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
            {pending.length} in attesa
          </span>
        )}
        <a href="/admin/pubblicita" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--ms-green-light)', color: 'var(--ms-green)', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600, border: '1px solid var(--ms-green)' }}>
          <Layout size={14} /> Gestione pubblicità
        </a>
        <a href="/admin/ruoli" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#f3eafb', color: '#7c3d9e', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600, border: '1px solid #c9a8e8' }}>
          ⚽ Gestione ruoli
        </a>
        <a href="/admin/documenti" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#f0f7fa', color: '#2a5a78', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600, border: '1px solid #b0d4e0' }}>
          📄 Gestione documenti
        </a>
        <button onClick={() => setTabPrincipale(tabPrincipale === 'utenti' ? 'conversazioni' : 'utenti')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: tabPrincipale === 'conversazioni' ? 'var(--ms-green)' : '#f0f7fa', color: tabPrincipale === 'conversazioni' ? '#fff' : '#2a5a78', borderRadius: 8, border: '1px solid #b0d4e0', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Barlow, sans-serif' }}>
          💬 {tabPrincipale === 'conversazioni' ? 'Mostra utenti' : 'Conversazioni'}
        </button>
        <PuliziaButton />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'In attesa', value: pending.length, color: '#f59e0b', icon: <Clock size={20} /> },
          { label: 'Approvati', value: approved.length, color: 'var(--ms-green)', icon: <Users size={20} /> },
          { label: 'Totale', value: pending.length + approved.length, color: '#6366f1', icon: <User size={20} /> },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Tabs */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 2, borderBottom: '2px solid #e5e7eb', flex: '0 0 auto' }}>
          {(['pending', 'approved'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 20px', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: `2px solid ${tab === t ? 'var(--ms-green)' : 'transparent'}`,
              color: tab === t ? 'var(--ms-green)' : '#6b7280',
              fontWeight: tab === t ? 600 : 400, fontSize: 14, fontFamily: 'Barlow, sans-serif',
              marginBottom: -2,
            }}>
              {t === 'pending' ? `In attesa (${pending.length})` : `Approvati (${approved.length})`}
            </button>
          ))}
        </div>
        {/* Search box */}
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            className="ms-input"
            style={{ paddingLeft: 30, fontSize: 13, height: 36 }}
            placeholder="Cerca per alias, email, nome, comune..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Lista utenti */}
      {lista.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
          <Check size={36} style={{ margin: '0 auto 12px', display: 'block', color: '#d1d5db' }} />
          <p style={{ fontSize: 15 }}>
            {search ? 'Nessun risultato per questa ricerca' : tab === 'pending' ? 'Nessuna registrazione in attesa' : 'Nessun utente approvato'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lista.map(u => (
            <div key={u.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              {/* Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--ms-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ms-green)', flexShrink: 0 }}>
                  {tipoIcon(u.tipo)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {u.alias}
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', background: 'var(--ms-green-light)', color: 'var(--ms-green)', padding: '1px 6px', borderRadius: 8 }}>
                      {u.tipo}
                    </span>
                    {(u as any).nomeSocieta && (
                      <span style={{ fontSize: 12, color: '#6b7280' }}>— {(u as any).nomeSocieta}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', flexWrap: 'wrap', gap: '0 12px', marginTop: 2 }}>
                    <span>{u.email}</span>
                    <span>📍 {u.comune}, {u.regione}</span>
                    <span>🏃 {u.sport.map((s: Sport) => SPORT_LABELS[s]).join(', ')}</span>
                    <span>📅 {new Date(u.createdAt).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                    style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {expanded === u.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Dettagli
                  </button>

                  {tab === 'pending' ? (
                    <>
                      <button onClick={() => azione(u.id, 'rifiuta')} disabled={loading === u.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                        <X size={14} /> Rifiuta
                      </button>
                      <button onClick={() => azione(u.id, 'approva')} disabled={loading === u.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', background: 'var(--ms-green)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                        <Check size={14} /> Approva
                      </button>
                    </>
                  ) : (
                    confirmDelete === u.id ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 500 }}>Conferma?</span>
                        <button onClick={() => eliminaUtente(u.id)} disabled={loading === u.id}
                          style={{ padding: '5px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                          Sì, elimina
                        </button>
                        <button onClick={() => setConfirmDelete(null)}
                          style={{ padding: '5px 10px', background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#6b7280' }}>
                          Annulla
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(u.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                        <Trash2 size={13} /> Elimina
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {expanded === u.id && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 16px', background: '#f9fafb' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                    {[
                      { l: 'Nome completo', v: `${u.nome} ${u.cognome}` },
                      { l: 'Data nascita', v: u.dataNascita },
                      { l: 'Codice fiscale', v: u.codiceFiscale },
                      { l: 'Telefono', v: u.telefono },
                      { l: 'Sport', v: u.sport.join(', ') },
                      { l: 'Ruoli', v: u.ruoli.join(', ') },
                      { l: 'Categorie', v: u.categoria.join(', ') },
                      { l: 'Email verificata', v: u.emailVerificato ? '✅ Sì' : '❌ No' },
                      { l: 'Stato account', v: u.stato },
                      { l: 'ID', v: u.id },
                    ].map(({ l, v }) => (
                      <div key={l}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{l}</div>
                        <div style={{ fontSize: 13, color: '#374151', marginTop: 2, wordBreak: 'break-all' }}>{v || '—'}</div>
                      </div>
                    ))}
                    {(u as any).descrizione && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Descrizione annuncio</div>
                        <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>{(u as any).descrizione}</div>
                      </div>
                    )}
                  </div>

                  {/* Dati genitore se minorenne */}
                  {(u as any).genitore && (
                    <div style={{ marginTop: 8, padding: 12, background: '#fef3c7', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>
                        👨‍👦 Dati genitore/tutore (utente minorenne)
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                        {Object.entries((u as any).genitore).map(([k, v]) => (
                          <div key={k}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: '#b45309', textTransform: 'uppercase' }}>{k}</div>
                            <div style={{ fontSize: 12, color: '#374151' }}>{String(v)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Annunci dell'utente */}
                  <AnnunciUtente userId={u.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PuliziaButton() {
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<string | null>(null)

  const eseguiPulizia = async () => {
    if (!confirm('Eliminare tutti gli annunci scaduti? L\'operazione è irreversibile.')) return
    setLoading(true)
    const res = await fetch('/api/admin/pulizia', { method: 'POST' })
    const data = await res.json()
    setResult(`Eliminati ${data.eliminati} annunci scaduti`)
    setLoading(false)
    setTimeout(() => setResult(null), 4000)
  }

  return (
    <button onClick={eseguiPulizia} disabled={loading}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: loading ? '#f3f4f6' : '#fef3e2', color: '#c07820', borderRadius: 8, border: '1px solid #f0c060', cursor: loading ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Barlow, sans-serif' }}>
      <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
      {result || (loading ? 'Pulizia...' : '🗑 Pulizia annunci scaduti')}
    </button>
  )
}

function AnnunciUtente({ userId }: { userId: string }) {
  const [annunci, setAnnunci] = React.useState<any[] | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    fetch(`/api/annunci-v2?userId=${userId}&limit=20`)
      .then(r => r.json())
      .then(d => setAnnunci(d.annunci || []))
      .catch(() => setAnnunci([]))
  }, [userId])

  const elimina = async (annId: string, titolo: string) => {
    if (!confirm(`Eliminare l'annuncio "${titolo}"?`)) return
    setLoading(true)
    await fetch('/api/admin/annunci', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ annId }),
    })
    setAnnunci(prev => prev ? prev.filter(a => a.id !== annId) : [])
    setLoading(false)
  }

  if (!annunci) return <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Carico annunci...</div>
  if (annunci.length === 0) return <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Nessun annuncio</div>

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
        Annunci ({annunci.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {annunci.map(ann => (
          <div key={ann.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{ann.titolo}</span>
              <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>{ann.tipo} · {ann.sport} · {ann.comune}</span>
            </div>
            <button onClick={() => elimina(ann.id, ann.titolo)} disabled={loading}
              style={{ padding: '4px 10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontFamily: 'Barlow, sans-serif', fontWeight: 600 }}>
              🗑 Elimina
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConversazioniPanel() {
  const [conversazioni, setConversazioni] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [expanded, setExpanded] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetch('/api/admin/conversazioni')
      .then(r => r.json())
      .then(d => { setConversazioni(d.conversazioni || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const eliminaConv = async (convId: string) => {
    if (!confirm('Eliminare tutta la conversazione? Operazione irreversibile.')) return
    await fetch('/api/admin/conversazioni', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ convId }),
    })
    setConversazioni(prev => prev.filter(c => c.id !== convId))
  }

  const eliminaMsg = async (convId: string, msgIndex: number) => {
    if (!confirm('Eliminare questo messaggio?')) return
    await fetch('/api/admin/conversazioni', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ convId, msgIndex }),
    })
    setConversazioni(prev => prev.map(c => {
      if (c.id !== convId) return c
      const messaggi = [...c.messaggi]
      messaggi[msgIndex] = { ...messaggi[msgIndex], testo: '🚫 Messaggio eliminato dall\'amministratore', eliminato: true }
      return { ...c, messaggi }
    }))
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Carico conversazioni...</div>
  if (conversazioni.length === 0) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Nessuna conversazione</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{conversazioni.length} conversazioni totali</div>
      {conversazioni.map(conv => (
        <div key={conv.id} style={{ background: '#fff', border: '1px solid #d0dde2', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e2e34' }}>
                💬 {conv.partecipanti?.map((p: any) => p.alias).join(' ↔ ')}
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                {conv.messaggi?.length || 0} messaggi · Ultimo: {conv.ultimaAttivita ? new Date(conv.ultimaAttivita).toLocaleDateString('it-IT') : '—'}
              </div>
              {conv.ultimoMessaggio && (
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, fontStyle: 'italic' }}>
                  "{conv.ultimoMessaggio}"
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setExpanded(expanded === conv.id ? null : conv.id)}
                style={{ padding: '6px 12px', background: '#f0f7fa', color: '#4a7c8e', border: '1px solid #b0d4e0', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'Barlow, sans-serif' }}>
                {expanded === conv.id ? 'Chiudi' : 'Vedi messaggi'}
              </button>
              <button onClick={() => eliminaConv(conv.id)}
                style={{ padding: '6px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'Barlow, sans-serif' }}>
                🗑 Elimina tutto
              </button>
            </div>
          </div>
          {expanded === conv.id && (
            <div style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px', background: '#f9fafb', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(conv.messaggi || []).length === 0 ? (
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Nessun messaggio</div>
              ) : (
                [...(conv.messaggi || [])].reverse().map((msg: any, i: number) => {
                  const realIndex = (conv.messaggi.length - 1) - i
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '8px 10px', background: msg.eliminato ? '#fff0f0' : '#fff', borderRadius: 8, border: `1px solid ${msg.eliminato ? '#fecaca' : '#e5e7eb'}` }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#4a7c8e' }}>{msg.mittente || 'Utente'}</span>
                        <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 8 }}>{msg.timestamp ? new Date(msg.timestamp).toLocaleString('it-IT') : ''}</span>
                        <div style={{ fontSize: 13, color: msg.eliminato ? '#dc2626' : '#374151', marginTop: 2 }}>{msg.testo}</div>
                      </div>
                      {!msg.eliminato && (
                        <button onClick={() => eliminaMsg(conv.id, realIndex)}
                          style={{ padding: '3px 8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontFamily: 'Barlow, sans-serif', flexShrink: 0, marginLeft: 8 }}>
                          🗑
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
