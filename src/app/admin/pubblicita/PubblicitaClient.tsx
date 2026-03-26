'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, EyeOff, ExternalLink, Layout, Trash2, Check, Loader2, Globe, FileText } from 'lucide-react'
import type { SlotAd, TipoSlotAd } from '@/types'

const SLOT_LABELS: Record<string, { pos: string; size: string }> = {
  'left-1':  { pos: 'Sinistra — Slot 1 (alto)',  size: '140×320px' },
  'left-2':  { pos: 'Sinistra — Slot 2 (basso)', size: '140×240px' },
  'right-1': { pos: 'Destra — Slot 1 (alto)',    size: '140×320px' },
  'right-2': { pos: 'Destra — Slot 2 (basso)',   size: '140×240px' },
}

const PAGINE_INTERNE = [
  { value: '/registrazione', label: 'Registrazione' },
  { value: '/mappa',         label: 'Mappa annunci' },
  { value: '/accedi',        label: 'Accedi' },
  { value: '/',              label: 'Homepage' },
]

const COLORI_PRESET = [
  { bg: '#4a7c8e', text: '#ffffff', label: 'Azzurro' },
  { bg: '#2d6a4f', text: '#ffffff', label: 'Verde' },
  { bg: '#e8a030', text: '#1a1200', label: 'Ambra' },
  { bg: '#6d3d8c', text: '#ffffff', label: 'Viola' },
  { bg: '#c0392b', text: '#ffffff', label: 'Rosso' },
  { bg: '#1a2e3c', text: '#ffffff', label: 'Notte' },
  { bg: '#f0f7fa', text: '#4a7c8e', label: 'Chiaro' },
  { bg: '#ffffff', text: '#1e2e34', label: 'Bianco' },
]

interface Props { slots: SlotAd[] }

export default function PubblicitaClient({ slots: initialSlots }: Props) {
  const [slots, setSlots] = useState<SlotAd[]>(initialSlots)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<SlotAd>>({})

  const apriEditor = (slot: SlotAd) => {
    setEditing(slot.id)
    setForm({ ...slot })
    setSaved(null)
  }

  const chiudiEditor = () => {
    setEditing(null)
    setForm({})
  }

  const upd = (key: keyof SlotAd, val: any) =>
    setForm(f => ({ ...f, [key]: val }))

  const salva = async (slotId: string) => {
    setSaving(slotId)
    const res = await fetch('/api/admin/pubblicita', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, id: slotId }),
    })
    const data = await res.json()
    if (data.success) {
      setSlots(prev => prev.map(s => s.id === slotId ? data.data : s))
      setSaved(slotId)
      setTimeout(() => { setSaved(null); chiudiEditor() }, 1200)
    }
    setSaving(null)
  }

  const svuota = async (slotId: string) => {
    setSaving(slotId)
    await fetch('/api/admin/pubblicita', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: slotId, tipo: 'vuoto', attivo: false }),
    })
    setSlots(prev => prev.map(s => s.id === slotId
      ? { id: slotId, tipo: 'vuoto', attivo: false, updatedAt: new Date().toISOString() }
      : s
    ))
    setSaving(null)
    chiudiEditor()
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Link href="/admin" style={{ color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
          <ArrowLeft size={15} /> Pannello admin
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Layout size={22} style={{ color: 'var(--ms-green)' }} />
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 700, margin: 0 }}>
            Gestione Pubblicità
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '3px 0 0' }}>
            Configura i 4 slot pubblicitari nelle bande laterali del sito
          </p>
        </div>
      </div>

      {/* Layout preview */}
      <div style={{ background: '#f8fbfc', border: '1px solid #d0dde2', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#4a7c8e', margin: '0 0 12px' }}>📐 Posizione degli slot nella pagina</p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'stretch', maxWidth: 500 }}>
          {/* Left sidebar preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 60 }}>
            {['left-1', 'left-2'].map(id => {
              const s = slots.find(x => x.id === id)
              return (
                <div key={id} style={{
                  height: id.includes('1') ? 48 : 36,
                  borderRadius: 4, fontSize: 9, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: s?.attivo && s.tipo !== 'vuoto' ? (s.coloresfondo || '#4a7c8e') : '#e5e7eb',
                  color: s?.attivo && s.tipo !== 'vuoto' ? (s.coloretesto || '#fff') : '#9ca3af',
                  border: '1px solid', borderColor: s?.attivo && s.tipo !== 'vuoto' ? 'transparent' : '#d0dde2',
                }}>
                  {s?.attivo && s.tipo !== 'vuoto' ? (s.titolo?.slice(0, 8) || 'AD') : 'VUOTO'}
                </div>
              )
            })}
          </div>
          {/* Main content placeholder */}
          <div style={{ flex: 1, background: '#fff', borderRadius: 4, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 88 }}>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>Contenuto sito</span>
          </div>
          {/* Right sidebar preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 60 }}>
            {['right-1', 'right-2'].map(id => {
              const s = slots.find(x => x.id === id)
              return (
                <div key={id} style={{
                  height: id.includes('1') ? 48 : 36,
                  borderRadius: 4, fontSize: 9, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: s?.attivo && s.tipo !== 'vuoto' ? (s.coloresfondo || '#4a7c8e') : '#e5e7eb',
                  color: s?.attivo && s.tipo !== 'vuoto' ? (s.coloretesto || '#fff') : '#9ca3af',
                  border: '1px solid', borderColor: s?.attivo && s.tipo !== 'vuoto' ? 'transparent' : '#d0dde2',
                }}>
                  {s?.attivo && s.tipo !== 'vuoto' ? (s.titolo?.slice(0, 8) || 'AD') : 'VUOTO'}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Slot cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {slots.map(slot => {
          const info = SLOT_LABELS[slot.id]
          const isEditing = editing === slot.id

          return (
            <div key={slot.id} style={{
              background: '#fff', border: `1.5px solid ${isEditing ? 'var(--ms-green)' : '#d0dde2'}`,
              borderRadius: 12, overflow: 'hidden',
              boxShadow: isEditing ? '0 0 0 3px rgba(74,124,142,0.12)' : 'none',
              transition: 'all 0.15s',
            }}>
              {/* Slot header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f4f5', background: '#f8fbfc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{info?.pos}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{info?.size}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* Stato badge */}
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                    background: slot.attivo && slot.tipo !== 'vuoto' ? '#d8eff0' : '#f3f4f6',
                    color: slot.attivo && slot.tipo !== 'vuoto' ? '#2a6e78' : '#9ca3af',
                  }}>
                    {slot.attivo && slot.tipo !== 'vuoto' ? '● Attivo' : '○ Vuoto'}
                  </span>
                  {!isEditing && (
                    <button onClick={() => apriEditor(slot)} className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>
                      Modifica
                    </button>
                  )}
                </div>
              </div>

              {/* Preview slot attivo */}
              {!isEditing && slot.attivo && slot.tipo !== 'vuoto' && (
                <div style={{ padding: '12px 16px' }}>
                  <SlotPreview slot={slot} />
                </div>
              )}

              {/* Editor */}
              {isEditing && (
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Tipo */}
                  <div>
                    <label className="ms-label">Tipo di contenuto</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {([
                        { v: 'esterno', l: 'Link esterno', icon: <Globe size={14} /> },
                        { v: 'interno', l: 'Pagina interna', icon: <FileText size={14} /> },
                        { v: 'vuoto',   l: 'Vuoto', icon: <EyeOff size={14} /> },
                      ] as { v: TipoSlotAd; l: string; icon: React.ReactNode }[]).map(opt => (
                        <label key={opt.v} style={{
                          flex: 1, display: 'flex', alignItems: 'center', gap: 6,
                          padding: '8px 10px', cursor: 'pointer', borderRadius: 8,
                          border: `1.5px solid ${form.tipo === opt.v ? 'var(--ms-green)' : '#d0dde2'}`,
                          background: form.tipo === opt.v ? 'var(--ms-green-light)' : '#fff',
                          fontSize: 12, fontWeight: 600, color: form.tipo === opt.v ? 'var(--ms-green)' : '#6b7280',
                        }}>
                          <input type="radio" name={`tipo-${slot.id}`} value={opt.v}
                            checked={form.tipo === opt.v} onChange={() => upd('tipo', opt.v)}
                            style={{ display: 'none' }} />
                          <span style={{ color: form.tipo === opt.v ? 'var(--ms-green)' : '#9ca3af' }}>{opt.icon}</span>
                          {opt.l}
                        </label>
                      ))}
                    </div>
                  </div>

                  {form.tipo !== 'vuoto' && (
                    <>
                      {/* Testi */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label className="ms-label">Titolo</label>
                          <input className="ms-input" value={form.titolo || ''} onChange={e => upd('titolo', e.target.value)} placeholder="Es. Registrati ora!" />
                        </div>
                        <div>
                          <label className="ms-label">Sottotitolo</label>
                          <input className="ms-input" value={form.sottotitolo || ''} onChange={e => upd('sottotitolo', e.target.value)} placeholder="Es. È gratis" />
                        </div>
                      </div>

                      {/* Link */}
                      {form.tipo === 'esterno' && (
                        <div>
                          <label className="ms-label">URL esterno <span className="required">*</span></label>
                          <input className="ms-input" type="url" value={form.urlEsterno || ''} onChange={e => upd('urlEsterno', e.target.value)} placeholder="https://esempio.it" />
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 13, cursor: 'pointer' }}>
                            <input type="checkbox" checked={form.apriNuovaTab !== false} onChange={e => upd('apriNuovaTab', e.target.checked)} style={{ accentColor: 'var(--ms-green)' }} />
                            Apri in nuova scheda
                          </label>
                        </div>
                      )}

                      {form.tipo === 'interno' && (
                        <div>
                          <label className="ms-label">Pagina interna <span className="required">*</span></label>
                          <select className="ms-select" value={form.paginaInterna || ''} onChange={e => upd('paginaInterna', e.target.value)}>
                            <option value="">Seleziona pagina...</option>
                            {PAGINE_INTERNE.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                          </select>
                        </div>
                      )}

                      {/* URL immagine */}
                      <div>
                        <label className="ms-label">URL immagine (opzionale)</label>
                        <input className="ms-input" value={form.immagineUrl || ''} onChange={e => upd('immagineUrl', e.target.value)} placeholder="https://esempio.it/banner.jpg" />
                      </div>

                      {/* URL video YouTube/Vimeo */}
                      <div>
                        <label className="ms-label">🎬 URL Video YouTube/Vimeo (opzionale)</label>
                        <input className="ms-input" value={(form as any).videoUrl || ''} onChange={e => upd('videoUrl' as any, e.target.value)} placeholder="https://www.youtube.com/watch?v=... oppure https://youtu.be/..." />
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>Se presente, il video sostituisce l'immagine nel banner.</span>
                      </div>

                      {/* Colori */}
                      <div>
                        <label className="ms-label">Colore banner</label>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {COLORI_PRESET.map(c => (
                            <button key={c.bg} type="button"
                              onClick={() => { upd('coloresfondo', c.bg); upd('coloretesto', c.text) }}
                              style={{
                                width: 28, height: 28, borderRadius: 6,
                                background: c.bg, border: `2.5px solid ${form.coloresfondo === c.bg ? '#1e2e34' : 'transparent'}`,
                                cursor: 'pointer',
                              }}
                              title={c.label}
                            />
                          ))}
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <input type="color" value={form.coloresfondo || '#4a7c8e'} onChange={e => upd('coloresfondo', e.target.value)}
                              style={{ width: 28, height: 28, padding: 2, border: '1px solid #d0dde2', borderRadius: 6, cursor: 'pointer' }} />
                            <span style={{ fontSize: 11, color: '#9ca3af' }}>Personalizza</span>
                          </div>
                        </div>
                      </div>

                      {/* Attivo toggle */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 10px', background: '#f8fbfc', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                        <input type="checkbox" checked={form.attivo !== false} onChange={e => upd('attivo', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--ms-green)' }} />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>Slot attivo (visibile sul sito)</span>
                      </label>

                      {/* Preview live */}
                      <div>
                        <label className="ms-label">Anteprima</label>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <SlotPreview slot={form as SlotAd} preview />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Azioni */}
                  <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                    <button className="btn-ghost" onClick={chiudiEditor} style={{ flex: 1 }}>
                      Annulla
                    </button>
                    <button onClick={() => svuota(slot.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'Barlow, sans-serif' }}>
                      <Trash2 size={14} /> Svuota
                    </button>
                    <button className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onClick={() => salva(slot.id)} disabled={!!saving}>
                      {saving === slot.id ? <><Loader2 size={14} className="spinner" /> Salvo...</>
                        : saved === slot.id ? <><Check size={14} /> Salvato!</>
                        : <><Save size={14} /> Salva</>}
                    </button>
                  </div>
                </div>
              )}

              {/* Vuoto placeholder */}
              {!isEditing && (!slot.attivo || slot.tipo === 'vuoto') && (
                <div style={{ padding: 16, textAlign: 'center', color: '#9ca3af' }}>
                  <Layout size={20} style={{ margin: '0 auto 6px', display: 'block', opacity: 0.4 }} />
                  <p style={{ fontSize: 13, margin: 0 }}>Slot vuoto</p>
                  <button onClick={() => apriEditor(slot)} className="btn-secondary" style={{ marginTop: 8, fontSize: 12, padding: '5px 14px' }}>
                    + Aggiungi banner
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Anteprima del banner
function SlotPreview({ slot, preview }: { slot: Partial<SlotAd>; preview?: boolean }) {
  const w = preview ? 130 : 130
  const h = preview ? 100 : 80

  const content = (
    <div style={{
      width: w, height: h, borderRadius: 8, overflow: 'hidden',
      background: slot.coloresfondo || '#4a7c8e',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 10, cursor: slot.tipo !== 'vuoto' ? 'pointer' : 'default',
      border: '1px solid rgba(0,0,0,0.08)',
      position: 'relative',
    }}>
      {slot.immagineUrl && (
        <img src={slot.immagineUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {slot.titolo && (
          <div style={{ fontSize: 13, fontWeight: 800, color: slot.coloretesto || '#fff', lineHeight: 1.2, marginBottom: 3 }}>
            {slot.titolo}
          </div>
        )}
        {slot.sottotitolo && (
          <div style={{ fontSize: 11, color: slot.coloretesto || '#fff', opacity: 0.85 }}>
            {slot.sottotitolo}
          </div>
        )}
        {slot.tipo === 'esterno' && slot.urlEsterno && (
          <div style={{ marginTop: 6, fontSize: 9, color: slot.coloretesto || '#fff', opacity: 0.6, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
            <ExternalLink size={8} /> Link esterno
          </div>
        )}
        {slot.tipo === 'interno' && slot.paginaInterna && (
          <div style={{ marginTop: 6, fontSize: 9, color: slot.coloretesto || '#fff', opacity: 0.6 }}>
            → {PAGINE_INTERNE.find(p => p.value === slot.paginaInterna)?.label || slot.paginaInterna}
          </div>
        )}
      </div>
    </div>
  )

  return content
}
