'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { SPORT_LABELS, SPORT_ICONS, RUOLI_PER_SPORT, CATEGORIE, REGIONI_ITALIA, REGIONI_ITALIA_SELECT } from '@/types'
import type { Sport } from '@/types'
import { cercaComune } from '@/lib/comuni'
import type { Sport } from '@/types'

interface FiltriBarV2Props {
  filtriAttivi: Record<string, any>
  comuneUtente?: string
}

const TIPI_ANNUNCIO = [
  { v: 'ricerca_squadra',  l: '🔍 Cerca squadra' },
  { v: 'disponibilita',    l: '✋ Disponibilità' },
  { v: 'cerca_atleti',     l: '🔎 Cerco atleti' },
  { v: 'torneo',           l: '🏆 Torneo' },
  { v: 'amichevole',       l: '🤝 Amichevole' },
  { v: 'cerca_torneo',     l: '🔍 Cerco torneo' },
  { v: 'cerca_amichevole', l: '🔍 Cerco amichevole' },
]

export default function FiltriBarV2({ filtriAttivi, comuneUtente = '' }: FiltriBarV2Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [filtri, setFiltri] = useState<Record<string, any>>({ soloAttivi: false, comuneRicerca: comuneUtente, ...filtriAttivi })
  const [comuneSuggerimenti, setComuneSuggerimenti] = useState<string[]>([])

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
  const ruoliDisp = filtri.sport ? RUOLI_PER_SPORT[filtri.sport as Sport] || [] : []


  const sel: React.CSSProperties = { width: 'auto', minWidth: 120, padding: '7px 12px', fontSize: 13, height: 36 }

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #d0dde2', position: 'sticky', top: 56, zIndex: 40 }}>
      {/* Filtri rapidi sport con icone */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>Sport:</span>
        <button
          onClick={() => { upd('sport', ''); applica({ sport: '' }) }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 12px', borderRadius: 10, border: `2px solid ${!filtri.sport ? 'var(--ms-green)' : '#e5e7eb'}`, background: !filtri.sport ? 'var(--ms-green-light)' : '#f9fafb', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s', fontFamily: 'Barlow, sans-serif' }}>
          <span style={{ fontSize: 20 }}>🏅</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: !filtri.sport ? 'var(--ms-green)' : '#6b7280' }}>Tutti</span>
        </button>
        {(Object.entries(SPORT_LABELS) as [Sport, string][]).map(([v, l]) => (
          <button key={v}
            onClick={() => { const newSport = filtri.sport === v ? '' : v; upd('sport', newSport); applica({ sport: newSport, page: 1 }) }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 12px', borderRadius: 10, border: `2px solid ${filtri.sport === v ? 'var(--ms-green)' : '#e5e7eb'}`, background: filtri.sport === v ? 'var(--ms-green-light)' : '#f9fafb', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s', fontFamily: 'Barlow, sans-serif' }}>
            <span style={{ fontSize: 22 }}>{SPORT_ICONS[v]}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: filtri.sport === v ? 'var(--ms-green)' : '#6b7280', whiteSpace: 'nowrap' }}>{l}</span>
          </button>
        ))}
      </div>

      {/* Riga 1 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filtra:</span>

        {/* Tipo annuncio */}
        <select className="ms-select" style={sel} value={filtri.tipo || ''}
          onChange={e => upd('tipo', e.target.value)}>
          <option value="">Cerca nel Mondo dello Sport</option>
          {TIPI_ANNUNCIO.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
        </select>

        {/* Sport */}
        <select className="ms-select" style={sel} value={filtri.sport || ''}
          onChange={e => upd('sport', e.target.value)}>
          <option value="">Tutti gli sport</option>
          {Object.entries(SPORT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>

        {/* Filtro distanza - per tutti i tipi */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <select className="ms-select" style={{ ...sel, minWidth: 130 }} value={filtri.kmMax || ''}
            onChange={e => upd('kmMax', e.target.value || undefined)}>
            <option value="">Qualsiasi distanza</option>
            {[10, 20, 30, 50, 100].map(k => (
              <option key={k} value={k}>entro {k} km</option>
            ))}
          </select>
          {filtri.kmMax && (
            <div style={{ position: 'relative' }}>
              <input
                className="ms-input"
                style={{ width: 150, fontSize: 12, height: 36, paddingLeft: 10 }}
                placeholder={comuneUtente || 'Mio comune...'}
                value={filtri.comuneRicerca || ''}
                onChange={e => {
                  upd('comuneRicerca', e.target.value)
                  setComuneSuggerimenti(cercaComune(e.target.value))
                }}
                onBlur={() => setTimeout(() => setComuneSuggerimenti([]), 200)}
              />
              {comuneSuggerimenti.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, zIndex: 50,
                  background: '#fff', border: '1px solid #d0dde2', borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 150,
                }}>
                  {comuneSuggerimenti.map(c => (
                    <button key={c} type="button"
                      style={{ display: 'block', width: '100%', padding: '7px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'Barlow, sans-serif' }}
                      onMouseDown={() => { upd('comuneRicerca', c); setComuneSuggerimenti([]) }}>
                      📍 {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ruolo */}
        <select className="ms-select" style={{ ...sel, minWidth: 150 }} value={filtri.ruolo || ''}
          onChange={e => upd('ruolo', e.target.value)} disabled={!filtri.sport}>
          <option value="">{filtri.sport ? 'Tutti i ruoli' : 'Prima sport'}</option>
          {ruoliDisp.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        {/* Regione */}
        <select className="ms-select" style={sel} value={filtri.regione || ''}
          onChange={e => upd('regione', e.target.value)}>
          <option value="">Tutte le regioni</option>
          {REGIONI_ITALIA_SELECT.map(r => { const isPromo = r.startsWith('—'); return <option key={r} value={isPromo ? '' : r} disabled={isPromo} style={{ color: isPromo ? '#9ca3af' : 'inherit', fontStyle: isPromo ? 'italic' : 'normal' }}>{r}</option> })}
        </select>

        {/* Categoria */}
        <select className="ms-select" style={sel} value={filtri.categoria || ''}
          onChange={e => upd('categoria', e.target.value)}>
          <option value="">Tutte le categorie</option>
          {CATEGORIE.map(c => <option key={c} value={c}>{c}</option>)}
        </select>



        {/* Comune */}
        <div style={{ position: 'relative', flex: 1, minWidth: 150 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input className="ms-input" style={{ paddingLeft: 28, fontSize: 13, height: 36 }}
            placeholder="Comune..." value={filtri.comune || ''}
            onChange={e => upd('comune', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applica()} />
        </div>

        <button className="btn-primary" style={{ padding: '7px 18px', fontSize: 13, height: 36 }} onClick={applica}>Cerca</button>

        {/* Solo attivi toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: filtri.soloAttivi ? 'var(--ms-green)' : '#6b7280', padding: '0 4px', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={!!filtri.soloAttivi} onChange={e => { upd('soloAttivi', e.target.checked || undefined); applica() }} style={{ accentColor: 'var(--ms-green)', width: 15, height: 15 }} />
          Solo attivi
        </label>

        {haFiltri && (
          <button onClick={resetta} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 10px', background: 'none', border: '1px solid #d0dde2', borderRadius: 8, color: '#6b7280', cursor: 'pointer', fontSize: 12, height: 36 }}>
            <X size={13} /> Resetta
          </button>
        )}
      </div>

      {/* Pillole filtri attivi */}
      {haFiltri && (
        <div style={{ padding: '4px 20px 10px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filtri.tipo && <Pill label={TIPI_ANNUNCIO.find(t => t.v === filtri.tipo)?.l || filtri.tipo} onRemove={() => upd('tipo', '')} />}
          {filtri.sport && <Pill label={SPORT_LABELS[filtri.sport as Sport] || filtri.sport} onRemove={() => upd('sport', '')} />}
          {filtri.ruolo && <Pill label={filtri.ruolo} onRemove={() => upd('ruolo', '')} />}
          {filtri.regione && <Pill label={`📍 ${filtri.regione}`} onRemove={() => upd('regione', '')} />}
          {filtri.categoria && <Pill label={`🏆 ${filtri.categoria}`} onRemove={() => upd('categoria', '')} />}

          {filtri.comune && <Pill label={`🏙️ ${filtri.comune}`} onRemove={() => upd('comune', '')} />}
          {filtri.kmMax && <Pill label={`📍 entro ${filtri.kmMax} km da ${filtri.comuneRicerca || comuneUtente || 'me'}`} onRemove={() => { upd('kmMax', ''); upd('comuneRicerca', comuneUtente) }} />}
        </div>
      )}
    </div>
  )
}

function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--ms-green-light)', color: 'var(--ms-green)', padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ms-green)', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
    </span>
  )
}
