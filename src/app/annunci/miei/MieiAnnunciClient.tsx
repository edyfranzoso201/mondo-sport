'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, ArrowUp, Edit2, Trophy, Users, Calendar, MapPin, Check, Loader2, X, Save } from 'lucide-react'
import { SPORT_LABELS, RUOLI_PER_SPORT, CATEGORIE, REGIONI_ITALIA, REGIONI_ITALIA_SELECT } from '@/types'
import type { Annuncio, Sport } from '@/types'

const TIPO_LABELS: Record<string, { l: string; icon: string }> = {
  ricerca_squadra:  { l: 'Cerca squadra',    icon: '🔍' },
  disponibilita:    { l: 'Disponibilità',    icon: '✋' },
  cerca_atleti:     { l: 'Cerco atleti',     icon: '🔎' },
  torneo:           { l: 'Torneo',           icon: '🏆' },
  amichevole:       { l: 'Amichevole',       icon: '🤝' },
  cerca_torneo:     { l: 'Cerco torneo',     icon: '🔍' },
  cerca_amichevole: { l: 'Cerco amichevole', icon: '🤝' },
}

export default function MieiAnnunciClient({ annunci: initial }: { annunci: Annuncio[] }) {
  const [annunci, setAnnunci] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [bumped, setBumped] = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [editingKm, setEditingKm] = useState<string | null>(null)
  const [editKmVal, setEditKmVal] = useState<string>('30')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Annuncio>>({})

  const bump = async (id: string) => {
    setLoading(id)
    const now = new Date().toISOString()
    const scadeAt = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
    const res = await fetch(`/api/annunci-v2/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bumpedAt: now, updatedAt: now, scadeAt }),
    })
    if (res.ok) {
      setAnnunci(prev => prev.map(a => a.id === id ? { ...a, bumpedAt: now, scadeAt } : a)
        .sort((a, b) => new Date(b.bumpedAt).getTime() - new Date(a.bumpedAt).getTime()))
      setBumped(id); setTimeout(() => setBumped(null), 2500)
    }
    setLoading(null)
  }

  const elimina = async (id: string) => {
    setLoading(id)
    await fetch(`/api/annunci-v2/${id}`, { method: 'DELETE' })
    setAnnunci(prev => prev.filter(a => a.id !== id))
    setConfirmDel(null); setLoading(null)
  }

  const toggleAttivo = async (ann: Annuncio) => {
    setLoading(ann.id)
    const res = await fetch(`/api/annunci-v2/${ann.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attivo: !ann.attivo }),
    })
    if (res.ok) setAnnunci(prev => prev.map(a => a.id === ann.id ? { ...a, attivo: !a.attivo } : a))
    setLoading(null)
  }

  const toggleChiuso = async (ann: Annuncio) => {
    setLoading(ann.id)
    const ora = new Date()
    const scadenza3mesi = new Date(ora); scadenza3mesi.setMonth(scadenza3mesi.getMonth() + 3)
    const updates = ann.chiuso
      ? { chiuso: false, chiusoAt: null, scadeAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() }
      : { chiuso: true, chiusoAt: ora.toISOString(), scadeAt: scadenza3mesi.toISOString() }
    const res = await fetch(`/api/annunci-v2/${ann.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) setAnnunci(prev => prev.map(a => a.id === ann.id ? { ...a, ...(updates as any) } : a))
    setLoading(null)
  }

  const salvaKm = async (id: string) => {
    setLoading(id)
    const res = await fetch(`/api/annunci-v2/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kmRaggio: Number(editKmVal) }),
    })
    if (res.ok) setAnnunci(prev => prev.map(a => a.id === id ? { ...a, kmRaggio: Number(editKmVal) } : a))
    setEditingKm(null); setLoading(null)
  }

  // ── Editor inline annuncio ────────────────────────────────────────────────
  const apriEditor = (ann: Annuncio) => {
    setEditingId(ann.id)
    setEditForm({
      titolo: ann.titolo,
      descrizione: ann.descrizione,
      sport: ann.sport,
      ruoli: ann.ruoli,
      categoria: ann.categoria,
      comune: ann.comune,
      regione: ann.regione,
      nSquadreRicercate: ann.nSquadreRicercate,
      dataInizio: ann.dataInizio,
      dataFine: ann.dataFine,
      luogo: ann.luogo,
      piede: (ann as any).piede || '',
      altezza: (ann as any).altezza || '',
    })
  }

  const salvaMod = async (id: string) => {
    setLoading(id)
    const res = await fetch(`/api/annunci-v2/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editForm, updatedAt: new Date().toISOString() }),
    })
    if (res.ok) {
      setAnnunci(prev => prev.map(a => a.id === id ? { ...a, ...editForm } : a))
      setEditingId(null)
    }
    setLoading(null)
  }

  const toggleArr = (key: keyof Annuncio, val: string) => {
    const arr = (editForm[key] as string[]) || []
    setEditForm(f => ({ ...f, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] }))
  }

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 700, margin: 0 }}>I miei annunci</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>{annunci.length} annunci · Gli annunci recenti appaiono prima</p>
        </div>
        <Link href="/annunci/nuovo" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Plus size={15} /> Nuovo annuncio
        </Link>
      </div>

      {annunci.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px solid #d0dde2', borderRadius: 12 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📢</div>
          <p style={{ fontSize: 15, fontWeight: 500, color: '#6b7280', margin: '0 0 16px' }}>Nessun annuncio ancora</p>
          <Link href="/annunci/nuovo" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Plus size={15} /> Crea il tuo primo annuncio
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {annunci.map((ann, idx) => {
            const tipoConf = TIPO_LABELS[ann.tipo] || { l: ann.tipo, icon: '📢' }
            const isTorneo = ['torneo', 'amichevole', 'cerca_torneo', 'cerca_amichevole'].includes(ann.tipo as string)
            const isEditing = editingId === ann.id
            const ruoliDisp = editForm.sport ? RUOLI_PER_SPORT[editForm.sport as Sport] || [] : []

            return (
              <div key={ann.id} style={{ background: '#fff', border: `1px solid ${idx === 0 ? 'var(--ms-green)' : '#d0dde2'}`, borderRadius: 12, overflow: 'hidden' }}>
                {idx === 0 && (
                  <div style={{ background: 'var(--ms-green)', padding: '3px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ArrowUp size={11} style={{ color: '#fff' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Più recente — in cima ai risultati</span>
                  </div>
                )}

                <div style={{ padding: '14px 16px' }}>
                  {!isEditing ? (
                    // ── Vista normale ────────────────────────────────────────
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{tipoConf.icon} {tipoConf.l}</span>
                          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 10, background: '#e8f3f6', color: '#4a7c8e', fontWeight: 600 }}>{SPORT_LABELS[ann.sport] || ann.sport}</span>
                          {ann.categoria?.length > 0 && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 10, background: '#fef3c7', color: '#92400e' }}>{ann.categoria.slice(0,2).join(', ')}</span>}
                          <span style={{
                            fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 700,
                            background: !ann.attivo ? '#f3f4f6' : ann.chiuso ? '#fef3e2' : '#d8eff0',
                            color: !ann.attivo ? '#9ca3af' : ann.chiuso ? '#c07820' : '#2a6e78',
                          }}>
                            {!ann.attivo ? '○ Disattivo' : ann.chiuso ? '🔒 Non disponibile' : '● Attivo'}
                          </span>
                        </div>

                        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', lineHeight: 1.3 }}>{ann.titolo}</h3>
                        {ann.descrizione && <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 6px', lineHeight: 1.4 }}>{ann.descrizione}</p>}

                        <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <span><MapPin size={10} style={{ display: 'inline', marginRight: 2 }} />{ann.comune}, {ann.regione}</span>
                          {ann.ruoli?.length > 0 && <span>Ruoli: {ann.ruoli.slice(0,3).join(', ')}{ann.ruoli.length > 3 ? '...' : ''}</span>}
                          {isTorneo && ann.nSquadreRicercate && <span><Users size={10} style={{ display: 'inline', marginRight: 2 }} />{ann.nSquadreRicercate} squadre</span>}
                          {ann.dataInizio && <span><Calendar size={10} style={{ display: 'inline', marginRight: 2 }} />{ann.dataInizio}{ann.dataFine ? ` → ${ann.dataFine}` : ''}</span>}
                          {ann.kmRaggio !== undefined && (editingKm === ann.id ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <select value={editKmVal} onChange={e => setEditKmVal(e.target.value)}
                                style={{ fontSize: 11, padding: '1px 4px', border: '1px solid var(--ms-green)', borderRadius: 4, color: '#4a7c8e' }}>
                                {[10,20,30,50,100].map(k => <option key={k} value={k}>{k} km</option>)}
                              </select>
                              <button onClick={() => salvaKm(ann.id)} style={{ padding: '1px 6px', background: 'var(--ms-green)', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}><Check size={10} /></button>
                              <button onClick={() => setEditingKm(null)} style={{ padding: '1px 4px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 4, cursor: 'pointer' }}><X size={10} /></button>
                            </span>
                          ) : (
                            <button onClick={() => { setEditingKm(ann.id); setEditKmVal(String(ann.kmRaggio || 30)) }}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#e8f3f6', color: '#4a7c8e', border: '1px solid #b0d4e0', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow, sans-serif' }}>
                              📍 {ann.kmRaggio} km <Edit2 size={9} />
                            </button>
                          ))}
                          {(ann as any).scadeAt && (
                            <span style={{ fontSize: 10, fontWeight: 600, color: new Date((ann as any).scadeAt) < new Date(Date.now() + 30*24*60*60*1000) ? '#dc2626' : '#9ca3af' }}>
                              ⏱ Scade: {new Date((ann as any).scadeAt).toLocaleDateString('it-IT')}
                            </span>
                          )}
                          <span style={{ color: '#b0bec5' }}>Agg.: {new Date(ann.bumpedAt).toLocaleDateString('it-IT')}</span>
                        </div>
                      </div>

                      {/* Azioni */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => bump(ann.id)} disabled={loading === ann.id}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: bumped === ann.id ? '#d8eff0' : 'var(--ms-green-light)', color: bumped === ann.id ? '#2a6e78' : 'var(--ms-green)', border: `1px solid ${bumped === ann.id ? '#a8d8dc' : 'var(--ms-green)'}`, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Barlow, sans-serif', whiteSpace: 'nowrap' }}>
                          {loading === ann.id ? <Loader2 size={12} className="spinner" /> : bumped === ann.id ? <><Check size={12} /> In cima!</> : <><ArrowUp size={12} /> Porta in cima</>}
                        </button>

                        <button onClick={() => apriEditor(ann)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'transparent', color: '#4a7c8e', border: '1px solid #b0d4e0', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'Barlow, sans-serif', whiteSpace: 'nowrap' }}>
                          <Edit2 size={12} /> Modifica
                        </button>

                        <button onClick={() => toggleAttivo(ann)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'transparent', color: ann.attivo && !ann.chiuso ? '#9ca3af' : 'var(--ms-green)', border: '1px solid #d0dde2', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'Barlow, sans-serif', whiteSpace: 'nowrap' }}>
                          {ann.attivo && !ann.chiuso ? 'Disattiva' : 'Attiva'}
                        </button>

                        <button onClick={() => toggleChiuso(ann)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: ann.chiuso ? '#fef3e2' : 'transparent', color: ann.chiuso ? '#e8a030' : '#9ca3af', border: `1px solid ${ann.chiuso ? '#f0c060' : '#d0dde2'}`, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'Barlow, sans-serif', whiteSpace: 'nowrap' }}>
                          {ann.chiuso ? '🔓 Riapri chat' : '🔒 Non disponibile'}
                        </button>

                        {confirmDel === ann.id ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => elimina(ann.id)} style={{ padding: '5px 8px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontFamily: 'Barlow, sans-serif' }}>Sì</button>
                            <button onClick={() => setConfirmDel(null)} style={{ padding: '5px 8px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontFamily: 'Barlow, sans-serif' }}>No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDel(ann.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'Barlow, sans-serif' }}>
                            <Trash2 size={12} /> Elimina
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    // ── Editor inline ─────────────────────────────────────────
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--ms-green)' }}>
                          ✏️ Modifica annuncio
                        </h3>
                        <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
                      </div>

                      {/* Titolo */}
                      <div>
                        <label className="ms-label" style={{ fontSize: 12 }}>Titolo</label>
                        <input className="ms-input" value={editForm.titolo || ''} onChange={e => setEditForm(f => ({ ...f, titolo: e.target.value }))} />
                      </div>

                      {/* Descrizione */}
                      <div>
                        <label className="ms-label" style={{ fontSize: 12 }}>Descrizione</label>
                        <textarea className="ms-input" rows={3} style={{ resize: 'vertical', fontFamily: 'Barlow, sans-serif' }}
                          value={editForm.descrizione || ''} onChange={e => setEditForm(f => ({ ...f, descrizione: e.target.value }))} maxLength={500} />
                      </div>

                      {/* Sport */}
                      <div>
                        <label className="ms-label" style={{ fontSize: 12 }}>Sport</label>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {Object.entries(SPORT_LABELS).map(([v, l]) => (
                            <button key={v} type="button"
                              onClick={() => { setEditForm(f => ({ ...f, sport: v as Sport, ruoli: [] })) }}
                              style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${editForm.sport === v ? 'var(--ms-green)' : '#d0dde2'}`, background: editForm.sport === v ? 'var(--ms-green-light)' : '#fff', color: editForm.sport === v ? 'var(--ms-green)' : '#6b7280', fontSize: 12, cursor: 'pointer', fontFamily: 'Barlow, sans-serif', fontWeight: editForm.sport === v ? 600 : 400 }}>
                              {editForm.sport === v ? '✓ ' : ''}{l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Ruoli */}
                      {ruoliDisp.length > 0 && (
                        <div>
                          <label className="ms-label" style={{ fontSize: 12 }}>Ruoli</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {ruoliDisp.map(r => {
                              const sel = (editForm.ruoli as string[] || []).includes(r)
                              return (
                                <button key={r} type="button" onClick={() => toggleArr('ruoli', r)}
                                  style={{ padding: '4px 10px', borderRadius: 20, border: `1px solid ${sel ? 'var(--ms-green)' : '#d0dde2'}`, background: sel ? 'var(--ms-green-light)' : '#fff', color: sel ? 'var(--ms-green)' : '#374151', fontSize: 12, cursor: 'pointer', fontFamily: 'Barlow, sans-serif' }}>
                                  {sel ? '✓ ' : ''}{r}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Categoria */}
                      <div>
                        <label className="ms-label" style={{ fontSize: 12 }}>Categorie</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {CATEGORIE.map(c => {
                            const sel = (editForm.categoria as string[] || []).includes(c)
                            return (
                              <button key={c} type="button" onClick={() => toggleArr('categoria', c)}
                                style={{ padding: '4px 10px', borderRadius: 20, border: `1px solid ${sel ? '#d97706' : '#d0dde2'}`, background: sel ? '#fef3c7' : '#fff', color: sel ? '#92400e' : '#374151', fontSize: 12, cursor: 'pointer', fontFamily: 'Barlow, sans-serif' }}>
                                {c}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Campi torneo/amichevole */}
                      {['torneo', 'amichevole', 'cerca_torneo', 'cerca_amichevole'].includes(ann.tipo as string) && (
                        <div style={{ background: '#f8fbfc', border: '1px solid #d0dde2', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ms-green)', margin: 0 }}>
                            {({'torneo': '🏆 Dettagli torneo', 'amichevole': '🤝 Dettagli amichevole', 'cerca_torneo': '🔍 Ricerca torneo', 'cerca_amichevole': '🤝 Ricerca amichevole'} as Record<string,string>)[ann.tipo] || '📋 Dettagli evento'}
                          </p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                            <div>
                              <label className="ms-label" style={{ fontSize: 12 }}>N° squadre</label>
                              <input type="number" className="ms-input" min={2} max={64}
                                value={editForm.nSquadreRicercate || ''}
                                onChange={e => setEditForm(f => ({ ...f, nSquadreRicercate: e.target.value ? Number(e.target.value) : undefined }))}
                                placeholder="Es. 8" />
                            </div>
                            <div>
                              <label className="ms-label" style={{ fontSize: 12 }}>Data inizio</label>
                              <input type="date" className="ms-input"
                                value={editForm.dataInizio || ''}
                                onChange={e => setEditForm(f => ({ ...f, dataInizio: e.target.value || undefined }))} />
                            </div>
                            <div>
                              <label className="ms-label" style={{ fontSize: 12 }}>Data fine</label>
                              <input type="date" className="ms-input"
                                value={editForm.dataFine || ''}
                                min={editForm.dataInizio || ''}
                                onChange={e => setEditForm(f => ({ ...f, dataFine: e.target.value || undefined }))} />
                            </div>
                          </div>
                          <div>
                            <label className="ms-label" style={{ fontSize: 12 }}>Sede / Luogo</label>
                            <input className="ms-input"
                              value={editForm.luogo || ''}
                              onChange={e => setEditForm(f => ({ ...f, luogo: e.target.value || undefined }))}
                              placeholder="Es. Palasport Comunale, Via Roma 10, Torino" />
                          </div>
                        </div>
                      )}

                      {/* Posizione */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label className="ms-label" style={{ fontSize: 12 }}>Regione</label>
                          <select className="ms-select" value={editForm.regione || ''} onChange={e => setEditForm(f => ({ ...f, regione: e.target.value }))}>
                            <option value="">Seleziona</option>
                            {REGIONI_ITALIA_SELECT.map(r => { const isPromo = r.startsWith('—'); return <option key={r} value={isPromo ? '' : r} disabled={isPromo} style={{ color: isPromo ? '#9ca3af' : 'inherit', fontStyle: isPromo ? 'italic' : 'normal' }}>{r}</option> })}
                          </select>
                        </div>
                        <div>
                          <label className="ms-label" style={{ fontSize: 12 }}>Comune</label>
                          <input className="ms-input" value={editForm.comune || ''} onChange={e => setEditForm(f => ({ ...f, comune: e.target.value }))} />
                        </div>
                      </div>

                      {/* Azioni editor */}
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
                        <button className="btn-ghost" onClick={() => setEditingId(null)}>Annulla</button>
                        <button className="btn-primary" onClick={() => salvaMod(ann.id)} disabled={loading === ann.id}
                          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {loading === ann.id ? <><Loader2 size={14} className="spinner" /> Salvo...</> : <><Save size={14} /> Salva modifiche</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
