'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { SPORT_LABELS, RUOLI_PER_SPORT, CATEGORIE, REGIONI_ITALIA, REGIONI_ITALIA_SELECT } from '@/types'
import type { FiltriRicerca, Sport } from '@/types'

interface FiltriBarProps {
  filtriAttivi: FiltriRicerca
}

export default function FiltriBar({ filtriAttivi }: FiltriBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const [filtri, setFiltri] = useState<FiltriRicerca>(filtriAttivi)

  const aggiorna = (key: keyof FiltriRicerca, value: any) => {
    const nuovi = { ...filtri, [key]: value || undefined, page: 1 }
    if (key === 'sport') nuovi.ruolo = undefined
    setFiltri(nuovi)
  }

  const applica = () => {
    const params = new URLSearchParams()
    Object.entries(filtri).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && k !== 'limit') {
        params.set(k, String(v))
      }
    })
    router.push(`${pathname}?${params.toString()}`)
  }

  const resetta = () => {
    setFiltri({ page: 1 })
    router.push(pathname)
  }

  const haFiltri = Object.entries(filtri).some(([k, v]) => v && k !== 'page' && k !== 'limit')
  const ruoliDisponibili = filtri.sport ? RUOLI_PER_SPORT[filtri.sport as Sport] : []

  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky', top: 56, zIndex: 40,
    }}>
      {/* Main filter row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 20px', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Filtra:
        </span>

        {/* Sport */}
        <select
          className="ms-select"
          style={{ width: 'auto', minWidth: 120, padding: '7px 12px', fontSize: 13 }}
          value={filtri.sport || ''}
          onChange={e => aggiorna('sport', e.target.value)}
        >
          <option value="">Tutti gli sport</option>
          {Object.entries(SPORT_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        {/* Ruolo */}
        <select
          className="ms-select"
          style={{ width: 'auto', minWidth: 140, padding: '7px 12px', fontSize: 13 }}
          value={filtri.ruolo || ''}
          onChange={e => aggiorna('ruolo', e.target.value)}
          disabled={!filtri.sport}
        >
          <option value="">{filtri.sport ? 'Tutti i ruoli' : 'Prima seleziona sport'}</option>
          {ruoliDisponibili.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* Regione */}
        <select
          className="ms-select"
          style={{ width: 'auto', minWidth: 130, padding: '7px 12px', fontSize: 13 }}
          value={filtri.regione || ''}
          onChange={e => aggiorna('regione', e.target.value)}
        >
          <option value="">Tutte le regioni</option>
          {REGIONI_ITALIA_SELECT.map(r => { const isPromo = r.startsWith('—'); return <option key={r} value={isPromo ? '' : r} disabled={isPromo} style={{ color: isPromo ? '#9ca3af' : 'inherit', fontStyle: isPromo ? 'italic' : 'normal' }}>{r}</option> })}
        </select>

        {/* Categoria */}
        <select
          className="ms-select"
          style={{ width: 'auto', minWidth: 130, padding: '7px 12px', fontSize: 13 }}
          value={filtri.categoria || ''}
          onChange={e => aggiorna('categoria', e.target.value)}
        >
          <option value="">Tutte le categorie</option>
          {CATEGORIE.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Tipo */}
        <select
          className="ms-select"
          style={{ width: 'auto', minWidth: 110, padding: '7px 12px', fontSize: 13 }}
          value={filtri.tipo || ''}
          onChange={e => aggiorna('tipo', e.target.value)}
        >
          <option value="">Tutti i tipi</option>
          <option value="atleta">Atleta</option>
          <option value="societa">Società</option>
          <option value="staff">Staff tecnico</option>
        </select>

        {/* Comune search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 160 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              className="ms-input"
              style={{ paddingLeft: 30, fontSize: 13, height: 34 }}
              placeholder="Cerca comune..."
              value={filtri.comune || ''}
              onChange={e => aggiorna('comune', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applica()}
            />
          </div>
        </div>

        <button className="btn-primary" style={{ padding: '7px 18px', fontSize: 13 }} onClick={applica}>
          Cerca
        </button>

        {haFiltri && (
          <button
            onClick={resetta}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 10px', background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, color: '#6b7280', cursor: 'pointer', fontSize: 12 }}
          >
            <X size={13} /> Resetta
          </button>
        )}
      </div>

      {/* Filtri attivi - pillole */}
      {haFiltri && (
        <div style={{ padding: '4px 20px 10px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filtri.sport && (
            <span style={pillStyle}>
              ⚽ {SPORT_LABELS[filtri.sport as Sport]}
              <button onClick={() => aggiorna('sport', '')} style={pillXStyle}>×</button>
            </span>
          )}
          {filtri.ruolo && (
            <span style={pillStyle}>
              {filtri.ruolo}
              <button onClick={() => aggiorna('ruolo', '')} style={pillXStyle}>×</button>
            </span>
          )}
          {filtri.regione && (
            <span style={pillStyle}>
              📍 {filtri.regione}
              <button onClick={() => aggiorna('regione', '')} style={pillXStyle}>×</button>
            </span>
          )}
          {filtri.categoria && (
            <span style={pillStyle}>
              🏆 {filtri.categoria}
              <button onClick={() => aggiorna('categoria', '')} style={pillXStyle}>×</button>
            </span>
          )}
          {filtri.comune && (
            <span style={pillStyle}>
              🏙️ {filtri.comune}
              <button onClick={() => aggiorna('comune', '')} style={pillXStyle}>×</button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

const pillStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  background: 'var(--ms-green-light)', color: 'var(--ms-green)',
  padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 600,
}

const pillXStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--ms-green)', fontSize: 14, lineHeight: 1, padding: 0,
}
