'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Loader2, Check, Plus, X } from 'lucide-react'
import { SPORT_LABELS, RUOLI_PER_SPORT, CATEGORIE, REGIONI_ITALIA, REGIONI_ITALIA_SELECT } from '@/types'
import type { Sport, TipoAnnuncio } from '@/types'

interface Props { userId: string; userTipo: string }

const TIPI_BASE: { v: TipoAnnuncio; l: string; desc: string; icon: string }[] = [
  { v: 'ricerca_squadra', l: 'Cerco squadra',    desc: 'Sei un atleta che vuole trovare una squadra', icon: '🔍' },
  { v: 'disponibilita',   l: 'Sono disponibile', desc: 'Offri la tua disponibilità a squadre e società', icon: '✋' },
]
const TIPI_SOCIETA: { v: TipoAnnuncio; l: string; desc: string; icon: string }[] = [
  { v: 'cerca_atleti',     l: 'Cerco atleti',          desc: 'La società cerca giocatori, allenatori o staff', icon: '🔎' },
  { v: 'torneo',           l: 'Organizza torneo',       desc: 'Organizzi un torneo e cerchi squadre partecipanti', icon: '🏆' },
  { v: 'amichevole',       l: 'Organizza amichevole',   desc: 'Cerchi squadre per partite amichevoli', icon: '🤝' },
  { v: 'cerca_torneo',     l: 'Cerco torneo',           desc: 'Vuoi iscrivere la tua squadra ad un torneo', icon: '🔍' },
  { v: 'cerca_amichevole', l: 'Cerco amichevole',       desc: 'Cerchi avversari per partite amichevoli', icon: '🤝' },
]

export default function NuovoAnnuncioClient({ userId, userTipo }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<any>({
    tipo: '', titolo: '', descrizione: '', sport: '', ruoli: [], categoria: [],
    comune: '', regione: '', piede: '', altezza: '',
    nSquadreRicercate: '', dataInizio: '', dataFine: '', luogo: '', kmRaggio: '30',
  })

  const upd = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))
  const toggleArr = (k: string, v: string) => setForm((f: any) => ({
    ...f, [k]: f[k].includes(v) ? f[k].filter((x: string) => x !== v) : [...f[k], v],
  }))

  const isTorneo = ['torneo', 'amichevole', 'cerca_torneo', 'cerca_amichevole'].includes(form.tipo as string)
  const isCercaEvento = (form.tipo as string) === 'cerca_torneo' || (form.tipo as string) === 'cerca_amichevole'
  const tipiDisp = userTipo === 'societa' ? TIPI_SOCIETA : TIPI_BASE

  const salva = async () => {
    if (!form.tipo) { setError('Seleziona il tipo di annuncio'); return }
    const isSponsor = form.tipo === 'cerca_sponsor' || form.tipo === 'offre_sponsorizzazione'
    if (!form.titolo.trim()) { setError('Il titolo è obbligatorio'); return }
    if (!form.sport) { setError('Seleziona uno sport'); return }
    if (!form.regione) { setError('Seleziona la regione'); return }
    if (!form.comune.trim()) { setError('Inserisci il comune'); return }

    setLoading(true); setError('')
    const res = await fetch('/api/annunci-v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      setSuccess(true)
      setTimeout(() => router.push('/annunci/miei'), 1200)
    } else {
      setError(data.error || 'Errore nel salvataggio')
    }
    setLoading(false)
  }

  const [ruoliDinamici, setRuoliDinamici] = useState<Record<string, string[]>>(RUOLI_PER_SPORT)

  useEffect(() => {
    fetch('/api/ruoli').then(r => r.json()).then(d => { if (d.ruoli) setRuoliDinamici(d.ruoli) }).catch(() => {})
  }, [])

  const ruoliDisp = form.sport ? (ruoliDinamici[form.sport as Sport] || RUOLI_PER_SPORT[form.sport as Sport] || []) : []

  if (success) return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--ms-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Check size={32} style={{ color: 'var(--ms-green)' }} />
        </div>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Annuncio pubblicato!</h2>
        <p style={{ color: '#6b7280' }}>Reindirizzamento ai tuoi annunci...</p>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Link href="/" style={{ color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
          <ArrowLeft size={15} /> Annunci
        </Link>
        <span style={{ color: '#d0dde2' }}>/</span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Nuovo annuncio</span>
      </div>

      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 700, margin: '0 0 24px' }}>
        Crea un annuncio
      </h1>

      <div style={{ background: '#fff', border: '1px solid #d0dde2', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 14 }}>{error}</div>
        )}

        {/* Tipo */}
        <div>
          <label className="ms-label">Tipo di annuncio <span className="required">*</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tipiDisp.length}, 1fr)`, gap: 8, marginTop: 4 }}>
            {tipiDisp.map(t => (
              <button key={t.v} type="button" onClick={() => upd('tipo', t.v)}
                style={{ padding: '12px 8px', borderRadius: 10, border: `2px solid ${form.tipo === t.v ? 'var(--ms-green)' : '#d0dde2'}`, background: form.tipo === t.v ? 'var(--ms-green-light)' : '#fff', cursor: 'pointer', fontFamily: 'Barlow, sans-serif', textAlign: 'center', transition: 'all 0.12s' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{t.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: form.tipo === t.v ? 'var(--ms-green)' : '#374151' }}>{t.l}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, lineHeight: 1.3 }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Titolo */}
        <div>
          <label className="ms-label">Titolo <span className="required">*</span></label>
          <input className="ms-input" value={form.titolo} onChange={e => upd('titolo', e.target.value)}
            placeholder={isTorneo ? 'Es. Torneo estivo Under 16 — luglio 2026' : 'Es. Portiere cerca squadra Serie D Piemonte'} />
        </div>

        {/* Descrizione */}
        <div>
          <label className="ms-label">Descrizione</label>
          <textarea className="ms-input" rows={3} style={{ resize: 'vertical', fontFamily: 'Barlow, sans-serif' }}
            value={form.descrizione} onChange={e => upd('descrizione', e.target.value)}
            placeholder="Descrivi l'annuncio in dettaglio..." maxLength={500} />
          <span style={{ fontSize: 11, color: '#9ca3af', float: 'right' }}>{form.descrizione.length}/500</span>
        </div>

        {/* Campi specifici per annunci sponsor */}
        {(form.tipo === 'cerca_sponsor' || form.tipo === 'offre_sponsorizzazione') && (
          <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 12 }}>
              {form.tipo === 'cerca_sponsor' ? '🤝 Dettagli ricerca sponsor' : '💼 Dettagli offerta sponsorizzazione'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="ms-label">Settore merceologico</label>
                <input type="text" className="ms-input"
                  value={(form as any).settore || ''} onChange={e => upd('settore', e.target.value)}
                  placeholder="Es. Abbigliamento, Alimentare, Auto..." />
              </div>
              <div>
                <label className="ms-label">Budget indicativo</label>
                <select className="ms-select" value={(form as any).budget || ''} onChange={e => upd('budget', e.target.value)}>
                  <option value="">Non specificato</option>
                  <option value="sotto_500">Sotto €500</option>
                  <option value="500_2000">€500 - €2.000</option>
                  <option value="2000_5000">€2.000 - €5.000</option>
                  <option value="5000_10000">€5.000 - €10.000</option>
                  <option value="oltre_10000">Oltre €10.000</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="ms-label">Cosa offre/cerca</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {['Logo su maglia', 'Spazio pubblicitario', 'Materiale sportivo', 'Contributo economico', 'Prodotti/servizi', 'Visibilità social', 'Naming rights'].map(v => (
                  <button key={v} type="button"
                    onClick={() => {
                      const curr = (form as any).benefici || []
                      upd('benefici', curr.includes(v) ? curr.filter((x: string) => x !== v) : [...curr, v])
                    }}
                    style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${((form as any).benefici || []).includes(v) ? '#d97706' : '#d0dde2'}`, background: ((form as any).benefici || []).includes(v) ? '#fff7ed' : '#fff', color: ((form as any).benefici || []).includes(v) ? '#d97706' : '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Barlow, sans-serif' }}>
                    {((form as any).benefici || []).includes(v) ? '✓ ' : ''}{v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Piede e Altezza — solo per atleti in sport con piede */}
        {['ricerca_squadra', 'disponibilita', 'cerca_atleti'].includes(form.tipo as string) &&
         ['calcio', 'calcio5'].includes(form.sport as string) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="ms-label">Piede preferito</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[{ v: 'destro', l: '🦶 Destro' }, { v: 'sinistro', l: '🦶 Sinistro' }, { v: 'entrambi', l: '⚡ Entrambi' }].map(p => (
                  <button key={p.v} type="button" onClick={() => upd('piede', form.piede === p.v ? '' : p.v)}
                    style={{ flex: 1, padding: '7px 4px', borderRadius: 8, border: `1.5px solid ${form.piede === p.v ? 'var(--ms-green)' : '#d0dde2'}`, background: form.piede === p.v ? 'var(--ms-green-light)' : '#fff', color: form.piede === p.v ? 'var(--ms-green)' : '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Barlow, sans-serif' }}>
                    {form.piede === p.v ? '✓ ' : ''}{p.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="ms-label">Altezza (cm)</label>
              <input type="number" className="ms-input" min={140} max={220}
                value={form.altezza || ''} onChange={e => upd('altezza', e.target.value ? Number(e.target.value) : '')}
                placeholder="Es. 182" />
            </div>
          </div>
        )}

        {/* Solo altezza per pallavolo e basket */}
        {['ricerca_squadra', 'disponibilita', 'cerca_atleti'].includes(form.tipo as string) &&
         ['pallavolo', 'basket'].includes(form.sport as string) && (
          <div style={{ maxWidth: 200 }}>
            <label className="ms-label">Altezza (cm)</label>
            <input type="number" className="ms-input" min={140} max={220}
              value={form.altezza || ''} onChange={e => upd('altezza', e.target.value ? Number(e.target.value) : '')}
              placeholder="Es. 185" />
          </div>
        )}

        {/* Sport */}
        <div>
          <label className="ms-label">Sport <span className="required">*</span></label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(SPORT_LABELS).map(([v, l]) => (
              <button key={v} type="button" onClick={() => { upd('sport', v); upd('ruoli', []) }}
                style={{ padding: '7px 16px', borderRadius: 20, border: `1.5px solid ${form.sport === v ? 'var(--ms-green)' : '#d0dde2'}`, background: form.sport === v ? 'var(--ms-green-light)' : '#fff', color: form.sport === v ? 'var(--ms-green)' : '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Barlow, sans-serif' }}>
                {form.sport === v ? '✓ ' : ''}{l}
              </button>
            ))}
          </div>
        </div>

        {/* Ruoli */}
        {ruoliDisp.length > 0 && (
          <div>
            <label className="ms-label">Ruoli ricercati</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ruoliDisp.map(r => (
                <button key={r} type="button" onClick={() => toggleArr('ruoli', r)}
                  style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${form.ruoli.includes(r) ? 'var(--ms-green)' : '#d0dde2'}`, background: form.ruoli.includes(r) ? 'var(--ms-green-light)' : '#fff', color: form.ruoli.includes(r) ? 'var(--ms-green)' : '#374151', fontSize: 12, cursor: 'pointer', fontFamily: 'Barlow, sans-serif', fontWeight: form.ruoli.includes(r) ? 600 : 400 }}>
                  {form.ruoli.includes(r) ? '✓ ' : ''}{r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categoria */}
        <div>
          <label className="ms-label">Categoria</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIE.map(c => (
              <button key={c} type="button" onClick={() => toggleArr('categoria', c)}
                style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${form.categoria.includes(c) ? '#d97706' : '#d0dde2'}`, background: form.categoria.includes(c) ? '#fef3c7' : '#fff', color: form.categoria.includes(c) ? '#92400e' : '#374151', fontSize: 12, cursor: 'pointer', fontFamily: 'Barlow, sans-serif' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Posizione */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="ms-label">Regione <span className="required">*</span></label>
            <select className="ms-select" value={form.regione} onChange={e => upd('regione', e.target.value)}>
              <option value="">Seleziona</option>
              {REGIONI_ITALIA_SELECT.map(r => { const isPromo = r.startsWith('—'); return <option key={r} value={isPromo ? '' : r} disabled={isPromo} style={{ color: isPromo ? '#9ca3af' : 'inherit', fontStyle: isPromo ? 'italic' : 'normal' }}>{r}</option> })}
            </select>
          </div>
          <div>
            <label className="ms-label">Comune <span className="required">*</span></label>
            <input className="ms-input" value={form.comune} onChange={e => upd('comune', e.target.value)} placeholder="Es. Torino" />
          </div>
        </div>
        {/* Campi torneo/amichevole */}
        {isTorneo && (
          <div style={{ background: '#f8fbfc', border: '1px solid #d0dde2', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ms-green)', margin: 0 }}>
              {({'torneo': '🏆 Dettagli torneo', 'amichevole': '🤝 Dettagli amichevole', 'cerca_torneo': '🔍 Dettagli ricerca torneo', 'cerca_amichevole': '🤝 Dettagli ricerca amichevole'} as Record<string,string>)[form.tipo] || '📋 Dettagli evento'}
            </p>

            {/* Per "cerca torneo/amichevole": solo raggio km */}
            {isCercaEvento && (
              <div>
                <label className="ms-label">Raggio di ricerca dal tuo comune</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[10, 20, 30, 50, 100].map(km => (
                    <button key={km} type="button" onClick={() => upd('kmRaggio', String(km))}
                      style={{ padding: '7px 16px', borderRadius: 8, border: `1.5px solid ${form.kmRaggio === String(km) ? 'var(--ms-green)' : '#d0dde2'}`, background: form.kmRaggio === String(km) ? 'var(--ms-green-light)' : '#fff', color: form.kmRaggio === String(km) ? 'var(--ms-green)' : '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Barlow, sans-serif' }}>
                      {km} km
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '6px 0 0' }}>
                  La tua ricerca sarà visibile alle società nel raggio selezionato da <strong>{form.comune || 'il tuo comune'}</strong>
                </p>
              </div>
            )}

            {/* Per "organizza torneo/amichevole": dettagli evento */}
            {!isCercaEvento && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label className="ms-label" style={{ fontSize: 12 }}>N° squadre ricercate</label>
                  <input type="number" className="ms-input" min={2} max={64} value={form.nSquadreRicercate}
                    onChange={e => upd('nSquadreRicercate', e.target.value)} placeholder="Es. 8" />
                </div>
                <div>
                  <label className="ms-label" style={{ fontSize: 12 }}>Data inizio</label>
                  <input type="date" className="ms-input" value={form.dataInizio} onChange={e => upd('dataInizio', e.target.value)} />
                </div>
                <div>
                  <label className="ms-label" style={{ fontSize: 12 }}>Data fine</label>
                  <input type="date" className="ms-input" value={form.dataFine} onChange={e => upd('dataFine', e.target.value)} min={form.dataInizio} />
                </div>
              </div>
            )}

            {!isCercaEvento && (
              <div>
                <label className="ms-label" style={{ fontSize: 12 }}>Sede / Luogo</label>
                <input className="ms-input" value={form.luogo} onChange={e => upd('luogo', e.target.value)} placeholder="Es. Palasport Comunale, Via Roma 10, Torino" />
              </div>
            )}
          </div>
        )}

        {/* Azioni */}
        <div style={{ background: '#f8fbfc', border: '1px solid #d0dde2', borderRadius: 10, padding: '12px 14px' }}>
          <p style={{ fontSize: 12, color: '#4a6470', margin: 0, lineHeight: 1.6 }}>
            <strong>⏱ Scadenza automatica:</strong><br />
            • L'annuncio viene eliminato automaticamente dopo <strong>1 anno</strong> dall'ultimo aggiornamento.<br />
            • Se metti l'annuncio in modalità <strong>"Non disponibile"</strong>, viene eliminato dopo <strong>3 mesi</strong>.<br />
            • Usa "Porta in cima" per aggiornare la data e rinnovare la scadenza di 1 anno.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4 }}>
          <Link href="/" className="btn-ghost" style={{ textDecoration: 'none' }}>Annulla</Link>
          <button className="btn-primary" onClick={salva} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px' }}>
            {loading ? <><Loader2 size={15} className="spinner" /> Pubblicazione...</> : <><Send size={15} /> Pubblica annuncio</>}
          </button>
        </div>
      </div>
    </div>
  )
}
