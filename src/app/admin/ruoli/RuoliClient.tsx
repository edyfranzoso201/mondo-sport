'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Save, Check, Loader2, RotateCcw } from 'lucide-react'
import { RUOLI_PER_SPORT } from '@/types'

interface Props {
  ruoliAttuali: Record<string, string[]>
  sportLabels: Record<string, string>
}

export default function RuoliClient({ ruoliAttuali, sportLabels }: Props) {
  const [ruoli, setRuoli] = useState<Record<string, string[]>>(
    JSON.parse(JSON.stringify(ruoliAttuali))
  )
  const [nuoviRuoli, setNuoviRuoli] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const addRuolo = (sport: string) => {
    const testo = nuoviRuoli[sport]?.trim()
    if (!testo) return
    if (ruoli[sport]?.includes(testo)) return
    setRuoli(r => ({ ...r, [sport]: [...(r[sport] || []), testo] }))
    setNuoviRuoli(n => ({ ...n, [sport]: '' }))
  }

  const removeRuolo = (sport: string, ruolo: string) => {
    setRuoli(r => ({ ...r, [sport]: r[sport].filter(x => x !== ruolo) }))
  }

  const moveUp = (sport: string, idx: number) => {
    if (idx === 0) return
    const arr = [...ruoli[sport]]
    ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
    setRuoli(r => ({ ...r, [sport]: arr }))
  }

  const moveDown = (sport: string, idx: number) => {
    const arr = [...ruoli[sport]]
    if (idx >= arr.length - 1) return
    ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
    setRuoli(r => ({ ...r, [sport]: arr }))
  }

  const ripristina = (sport: string) => {
    setRuoli(r => ({ ...r, [sport]: [...(RUOLI_PER_SPORT as any)[sport]] }))
  }

  const salva = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/ruoli', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ruoli }),
    })
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Link href="/admin" style={{ color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
          <ArrowLeft size={15} /> Pannello admin
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 700, margin: 0 }}>
            Gestione Ruoli
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>
            Modifica i ruoli disponibili per ogni sport. Le modifiche si applicano a tutti i nuovi annunci.
          </p>
        </div>
        <button className="btn-primary" onClick={salva} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}>
          {saving ? <><Loader2 size={15} className="spinner" /> Salvo...</>
            : saved ? <><Check size={15} /> Salvato!</>
            : <><Save size={15} /> Salva tutto</>}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.entries(sportLabels).map(([sport, label]) => (
          <div key={sport} style={{ background: '#fff', border: '1px solid #d0dde2', borderRadius: 12, overflow: 'hidden' }}>
            {/* Header sport */}
            <div style={{ padding: '12px 16px', background: '#f8fbfc', borderBottom: '1px solid #f0f4f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{label}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{ruoli[sport]?.length || 0} ruoli</span>
                <button onClick={() => ripristina(sport)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'none', border: '1px solid #d0dde2', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#6b7280', fontFamily: 'Barlow, sans-serif' }}>
                  <RotateCcw size={12} /> Ripristina default
                </button>
              </div>
            </div>

            <div style={{ padding: 16 }}>
              {/* Lista ruoli */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {(ruoli[sport] || []).map((r, idx) => (
                  <div key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0f4f5', border: '1px solid #d0dde2', borderRadius: 20, padding: '4px 4px 4px 10px' }}>
                    <span style={{ fontSize: 13 }}>{r}</span>
                    <div style={{ display: 'flex', gap: 1 }}>
                      <button onClick={() => moveUp(sport, idx)}
                        style={{ width: 18, height: 18, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Sposta su">↑</button>
                      <button onClick={() => moveDown(sport, idx)}
                        style={{ width: 18, height: 18, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Sposta giù">↓</button>
                      <button onClick={() => removeRuolo(sport, r)}
                        style={{ width: 20, height: 20, background: '#fee2e2', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Aggiungi nuovo */}
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="ms-input" style={{ flex: 1, fontSize: 13, height: 34 }}
                  placeholder={`Aggiungi ruolo per ${label}...`}
                  value={nuoviRuoli[sport] || ''}
                  onChange={e => setNuoviRuoli(n => ({ ...n, [sport]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addRuolo(sport)} />
                <button className="btn-primary" style={{ height: 34, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}
                  onClick={() => addRuolo(sport)}>
                  <Plus size={14} /> Aggiungi
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Salva in fondo */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button className="btn-primary" onClick={salva} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px' }}>
          {saving ? <><Loader2 size={15} className="spinner" /> Salvo...</>
            : saved ? <><Check size={15} /> Salvato!</>
            : <><Save size={15} /> Salva tutti i ruoli</>}
        </button>
      </div>
    </div>
  )
}
