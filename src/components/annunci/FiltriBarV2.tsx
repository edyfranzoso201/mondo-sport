'use client'
import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { SPORT_LABELS, SPORT_ICONS, RUOLI_PER_SPORT, CATEGORIE, REGIONI_ITALIA_SELECT } from '@/types'
import type { Sport } from '@/types'
import { cercaComune } from '@/lib/comuni'

interface FiltriBarV2Props {
  filtriAttivi: Record<string, any>
  comuneUtente?: string
}

const TIPI_ANNUNCIO = [
  { v: 'ricerca_squadra', l: '🔍 Cerca squadra' },
  { v: 'disponibilita',   l: '✋ Disponibilità' },
  { v: 'cerca_atleti',    l: '🔎 Cerco atleti' },
  { v: 'torneo',          l: '🏆 Torneo' },
  { v: 'amichevole',      l: '🤝 Amichevole' },
  { v: 'cerca_torneo',    l: '🔍 Cerco torneo' },
  { v: 'cerca_amichevole',l: '🔍 Cerco amichevole' },
]

const FILTRI_TIPO = [
  { v: '',                      icon: '📋', label: 'Tutti' },
  { v: 'ricerca_squadra',       icon: '🔍', label: 'Cerca squadra' },
  { v: 'cerca_atleti',          icon: '👤', label: 'Cerca atleti' },
  { v: 'torneo',                icon: '🏆', label: 'Torneo' },
  { v: 'amichevole',            icon: '🤝', label: 'Amichevole' },
  { v: 'cerca_sponsor',         icon: '🤝', label: 'Cerca Sponsor' },
  { v: 'offre_sponsorizzazione',icon: '💼', label: 'Sponsor' },
]

export default function FiltriBarV2({ filtriAttivi, comuneUtente = '' }: FiltriBarV2Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [filtri, setFiltri] = useState<Record<string, any>>({
    soloAttivi: false,
    comuneRicerca: comuneUtente,
    ...filtriAttivi,
  })
  const [comuneSuggerimenti, setComuneSuggerimenti] = useState<string[]>([])
  const [mostraFiltriAvanzati, setMostraFiltriAvanzati] = useState(false)
  const [ruoliDinamici, setRuoliDinamici] = useState<Record<string, string[]>>(RUOLI_PER_SPORT)

  React.useEffect(() => {
    fetch('/api/ruoli')
      .then(r => r.json())
      .then(d => { if (d.ruoli) setRuoliDinamici(d.ruoli) })
      .catch(() => {})
  }, [])

  const upd = (key: string, val: any) => {
    const nuovi = { ...filtri, [key]: val || undefined, page: 1 }
    if (key === 'sport') nuovi.ruolo = undefined
    setFiltri(nuovi)
  }

  const applica = (overrides?: Record<string, any>) => {
    const params = new URLSearchParams()
    const merged = { ...filtri, ...(overrides || {}) }
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && k !== 'limit') params.set(k, String(v))
    })
    router.push(`${pathname}?${params.toString()}`)
  }

  const resetta = () => { setFiltri({ page: 1 }); router.push(pathname) }
  const haFiltri = Object.entries(filtri).some(([k, v]) => v && k !== 'page' && k !== 'limit')
  const ruoliDisp = filtri.sport
    ? (ruoliDinamici[filtri.sport as Sport] || RUOLI_PER_SPORT[filtri.sport as Sport] || [])
    : []

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '8px 0 6px', position: 'sticky', top: 0, zIndex: 40, fontFamily: 'Barlow, sans-serif' }}>

      {/* ── RIGA SPORT ── */}
      <div style={{ overflowX: 'auto', display: 'flex', gap: 4, padding: '0 10px 5px', scrollbarWidth: 'none' }}>
        <button
          onClick={() => { upd('sport', ''); applica({ sport: '' }) }}
          style={chipStyle(!filtri.sport, 'green')}
          title="Tutti gli sport"
        >
          <span className="chip-icon">🌐</span>
          <span className="chip-label">Tutti</span>
        </button>

        {(Object.entries(SPORT_LABELS) as [Sport, string][]).map(([v, l]) => (
          <button
            key={v}
            title={l}
            onClick={() => { const ns = filtri.sport === v ? '' : v; upd('sport', ns); applica({ sport: ns, page: 1 }) }}
            style={chipStyle(filtri.sport === v, 'green')}
          >
            <span className="chip-icon">{SPORT_ICONS[v]}</span>
            <span className="chip-label">{l}</span>
          </button>
        ))}
      </div>

      {/* ── RIGA TIPO ANNUNCIO ── */}
      <div style={{ overflowX: 'auto', display: 'flex', gap: 4, padding: '0 10px 7px', scrollbarWidth: 'none' }}>
        {FILTRI_TIPO.map(({ v, icon, label }) => {
          const attivo = filtri.tipo === v || (!filtri.tipo && v === '')
          return (
            <button
              key={v || 'tutti'}
              title={label}
              onClick={() => { upd('tipo', v); applica({ tipo: v, page: 1 }) }}
              style={chipStyle(attivo, 'amber')}
            >
              <span className="chip-icon">{icon}</span>
              <span className="chip-label">{label}</span>
            </button>
          )
        })}
      </div>

      {/* ── BARRA RICERCA + PULSANTE FILTRI AVANZATI ── */}
      <div style={{ display: 'flex', gap: 6, padding: '0 10px', alignItems: 'center' }}>
        {/* Campo comune */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Comune..."
            value={filtri.comune || ''}
            onChange={e => upd('comune', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applica()}
            style={{ width: '100%', padding: '6px 8px 6px 28px', borderRadius: 8, border: '1.5px solid #d1d5db', fontSize: 13, height: 34, outline: 'none' }}
          />
          {comuneSuggerimenti.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: 2 }}>
              {comuneSuggerimenti.map(c => (
                <div key={c} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13 }}
                  onMouseDown={() => { upd('comuneRicerca', c); setComuneSuggerimenti([]) }}>
                  📍 {c}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pulsante Filtri avanzati */}
        <button
          onClick={() => setMostraFiltriAvanzati(v => !v)}
          title="Filtri avanzati"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            padding: '0 10px', borderRadius: 8, height: 34,
            border: `1.5px solid ${mostraFiltriAvanzati ? 'var(--ms-green, #16a34a)' : '#d1d5db'}`,
            background: mostraFiltriAvanzati ? 'var(--ms-green-light, #dcfce7)' : '#f9fafb',
            color: mostraFiltriAvanzati ? 'var(--ms-green, #16a34a)' : '#374151',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            transition: 'all 0.15s', minWidth: 34,
          }}
        >
          <SlidersHorizontal size={14} />
          <span className="btn-label">Filtri</span>
          <ChevronDown size={12} style={{ transform: mostraFiltriAvanzati ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {/* Cerca */}
        <button
          onClick={() => applica()}
          title="Cerca"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '0 12px', borderRadius: 8, height: 34, background: 'var(--ms-green, #16a34a)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', minWidth: 34 }}
        >
          <Search size={14} />
          <span className="btn-label">Cerca</span>
        </button>

        {/* Resetta */}
        {haFiltri && (
          <button
            onClick={resetta}
            title="Resetta filtri"
            style={{ padding: 0, borderRadius: 8, height: 34, width: 34, background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* ── PANNELLO FILTRI AVANZATI ── */}
      {mostraFiltriAvanzati && (
        <div style={{ padding: '10px 10px 4px', borderTop: '1px solid #f3f4f6', marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>

          <select value={filtri.tipo || ''} onChange={e => upd('tipo', e.target.value)} style={selectStyle}>
            <option value="">Tutti i tipi</option>
            {TIPI_ANNUNCIO.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>

          <select value={filtri.sport || ''} onChange={e => upd('sport', e.target.value)} style={selectStyle}>
            <option value="">Tutti gli sport</option>
            {(Object.entries(SPORT_LABELS) as [Sport, string][]).map(([v, l]) => (
              <option key={v} value={v}>{SPORT_ICONS[v]} {l}</option>
            ))}
          </select>

          <select value={filtri.regione || ''} onChange={e => upd('regione', e.target.value)} style={selectStyle}>
            <option value="">Tutte le regioni</option>
            {REGIONI_ITALIA_SELECT.map(r => {
              const isPromo = r.startsWith('—')
              return <option key={r} value={isPromo ? '' : r} disabled={isPromo}>{r}</option>
            })}
          </select>

          <select value={filtri.categoria || ''} onChange={e => upd('categoria', e.target.value)} style={selectStyle}>
            <option value="">Tutte le categorie</option>
            {CATEGORIE.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {ruoliDisp.length > 0 && (
            <select value={filtri.ruolo || ''} onChange={e => upd('ruolo', e.target.value)} style={selectStyle}>
              <option value="">Tutti i ruoli</option>
              {ruoliDisp.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          )}

          <select value={filtri.kmMax || ''} onChange={e => upd('kmMax', e.target.value || undefined)} style={selectStyle}>
            <option value="">Qualsiasi distanza</option>
            {[10, 20, 30, 50, 100].map(k => <option key={k} value={k}>entro {k} km</option>)}
          </select>

          {filtri.kmMax && (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Comune di riferimento"
                value={filtri.comuneRicerca || ''}
                onChange={e => {
                  upd('comuneRicerca', e.target.value)
                  setComuneSuggerimenti(cercaComune(e.target.value))
                }}
                onBlur={() => setTimeout(() => setComuneSuggerimenti([]), 200)}
                style={{ ...selectStyle, paddingLeft: 10 }}
              />
              {comuneSuggerimenti.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 200, marginTop: 2 }}>
                  {comuneSuggerimenti.map(c => (
                    <div key={c} style={{ padding: '7px 12px', cursor: 'pointer', fontSize: 13 }}
                      onMouseDown={() => { upd('comuneRicerca', c); setComuneSuggerimenti([]) }}>
                      📍 {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', cursor: 'pointer', height: 36 }}>
            <input
              type="checkbox"
              checked={!!filtri.soloAttivi}
              onChange={e => { upd('soloAttivi', e.target.checked || undefined); applica() }}
              style={{ accentColor: 'var(--ms-green, #16a34a)', width: 15, height: 15 }}
            />
            Solo attivi
          </label>

          <button
            onClick={() => { applica(); setMostraFiltriAvanzati(false) }}
            style={{ padding: '7px 14px', borderRadius: 8, height: 36, background: 'var(--ms-green, #16a34a)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}
          >
            Applica
          </button>
        </div>
      )}

      {/* ── PILLOLE FILTRI ATTIVI ── */}
      {haFiltri && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '5px 10px 0' }}>
          {filtri.tipo && <Pill label={TIPI_ANNUNCIO.find(t => t.v === filtri.tipo)?.l || filtri.tipo} onRemove={() => upd('tipo', '')} />}
          {filtri.sport && <Pill label={`${SPORT_ICONS[filtri.sport as Sport]} ${SPORT_LABELS[filtri.sport as Sport]}`} onRemove={() => upd('sport', '')} />}
          {filtri.ruolo && <Pill label={filtri.ruolo} onRemove={() => upd('ruolo', '')} />}
          {filtri.regione && <Pill label={filtri.regione} onRemove={() => upd('regione', '')} />}
          {filtri.categoria && <Pill label={filtri.categoria} onRemove={() => upd('categoria', '')} />}
          {filtri.comune && <Pill label={`📍 ${filtri.comune}`} onRemove={() => upd('comune', '')} />}
          {filtri.kmMax && <Pill label={`entro ${filtri.kmMax} km`} onRemove={() => { upd('kmMax', ''); upd('comuneRicerca', comuneUtente) }} />}
        </div>
      )}

      {/* ── CSS RESPONSIVE INLINE ── */}
      <style>{`
        /* DESKTOP: icona 18px + testo visibile */
        .chip-icon { font-size: 18px; line-height: 1; }
        .chip-label { font-size: 11px; font-weight: 600; }

        /* MOBILE (≤600px): icona ridotta a 15px, testo e label pulsanti nascosti */
        @media (max-width: 600px) {
          .chip-icon  { font-size: 15px; }
          .chip-label { display: none !important; }
          .btn-label  { display: none !important; }
        }

        /* Scrollbar nascosta ovunque */
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

// ── Stili riutilizzabili ──────────────────────────────────────────────────────

function chipStyle(attivo: boolean, color: 'green' | 'amber'): React.CSSProperties {
  const borderColor = attivo
    ? color === 'green' ? 'var(--ms-green, #16a34a)' : '#d97706'
    : '#e5e7eb'
  const bg = attivo
    ? color === 'green' ? 'var(--ms-green-light, #dcfce7)' : '#fffbeb'
    : '#f9fafb'
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: '4px 7px',
    minWidth: 36,
    minHeight: 36,
    borderRadius: 8,
    border: `2px solid ${borderColor}`,
    background: bg,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.15s',
    fontFamily: 'Barlow, sans-serif',
    fontWeight: 600,
    color: attivo ? (color === 'green' ? 'var(--ms-green, #16a34a)' : '#d97706') : '#6b7280',
  }
}

const selectStyle: React.CSSProperties = {
  padding: '7px 10px',
  borderRadius: 8,
  border: '1.5px solid #d1d5db',
  fontSize: 13,
  height: 36,
  background: '#f9fafb',
  color: '#374151',
  cursor: 'pointer',
  minWidth: 140,
}

// ── Componente Pill ───────────────────────────────────────────────────────────

function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 9999,
      background: '#f0fdf4', border: '1px solid #bbf7d0',
      color: '#15803d', fontSize: 11, fontWeight: 600,
      fontFamily: 'Barlow, sans-serif',
    }}>
      {label}
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d', padding: 0, lineHeight: 1, display: 'flex' }}
        title="Rimuovi filtro"
      >
        <X size={11} />
      </button>
    </span>
  )
}