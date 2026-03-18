'use client'
import { useState } from 'react'
import { X, Bell, Check } from 'lucide-react'
import { SPORT_LABELS, RUOLI_PER_SPORT, CATEGORIE, REGIONI_ITALIA, REGIONI_ITALIA_SELECT } from '@/types'
import type { FiltriRicerca, Sport } from '@/types'

interface AlertModalProps {
  filtriAttivi: FiltriRicerca
  onClose: () => void
}

export default function AlertModal({ filtriAttivi, onClose }: AlertModalProps) {
  const [form, setForm] = useState({ ...filtriAttivi })
  const [salvato, setSalvato] = useState(false)
  const [loading, setLoading] = useState(false)

  const salva = async () => {
    setLoading(true)
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) setSalvato(true)
    setLoading(false)
  }

  if (salvato) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, textAlign: 'center', maxWidth: 320 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--ms-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Check size={28} style={{ color: 'var(--ms-green)' }} />
        </div>
        <h3 style={{ fontWeight: 600, margin: '0 0 8px' }}>Alert impostato!</h3>
        <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 20px' }}>Riceverai una email quando arriverà un nuovo annuncio con questi criteri.</p>
        <button className="btn-primary" style={{ width: '100%' }} onClick={onClose}>Chiudi</button>
      </div>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: 'var(--ms-green)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={18} style={{ color: '#fff' }} />
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Imposta alert</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>
            Ricevi una email quando appare un nuovo annuncio con questi criteri:
          </p>

          <div>
            <label className="ms-label">Sport</label>
            <select className="ms-select" value={form.sport || ''} onChange={e => setForm(f => ({ ...f, sport: e.target.value as Sport }))}>
              <option value="">Tutti gli sport</option>
              {Object.entries(SPORT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          {form.sport && (
            <div>
              <label className="ms-label">Ruolo</label>
              <select className="ms-select" value={form.ruolo || ''} onChange={e => setForm(f => ({ ...f, ruolo: e.target.value }))}>
                <option value="">Tutti i ruoli</option>
                {RUOLI_PER_SPORT[form.sport as Sport].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="ms-label">Regione</label>
            <select className="ms-select" value={form.regione || ''} onChange={e => setForm(f => ({ ...f, regione: e.target.value }))}>
              <option value="">Tutte le regioni</option>
              {REGIONI_ITALIA_SELECT.map(r => { const isPromo = r.startsWith('—'); return <option key={r} value={isPromo ? '' : r} disabled={isPromo} style={{ color: isPromo ? '#9ca3af' : 'inherit', fontStyle: isPromo ? 'italic' : 'normal' }}>{r}</option> })}
            </select>
          </div>

          <div>
            <label className="ms-label">Categoria</label>
            <select className="ms-select" value={form.categoria || ''} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
              <option value="">Tutte le categorie</option>
              {CATEGORIE.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: 4 }}
            onClick={salva}
            disabled={loading}
          >
            {loading ? 'Salvataggio...' : 'Salva alert'}
          </button>
        </div>
      </div>
    </div>
  )
}
