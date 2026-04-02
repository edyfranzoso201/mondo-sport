'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Loader2, Check, Shield } from 'lucide-react'
import { SPORT_LABELS, SPORT_ICONS, RUOLI_PER_SPORT, CATEGORIE, REGIONI_ITALIA } from '@/types'
import type { Sport, TipoAnnuncio } from '@/types'
import { cercaComune } from '@/lib/comuni'

const TIPI_UTENTE = [
  { v: 'atleta',   l: 'Atleta',                icon: '🏃' },
  { v: 'societa',  l: 'Società Sportiva',       icon: '🏛' },
  { v: 'staff',    l: 'Staff / Libero Prof.',   icon: '👨‍💼' },
  { v: 'admin',    l: 'Admin',                  icon: '🛡' },
]

const TUTTI_TIPI: { v: TipoAnnuncio; l: string; icon: string }[] = [
  { v: 'ricerca_squadra',       l: 'Cerca Squadra',           icon: '🔍' },
  { v: 'disponibilita',         l: 'Sono Disponibile',        icon: '✋' },
  { v: 'cerca_atleti',          l: 'Cerca Atleti',            icon: '🔎' },
  { v: 'torneo',                l: 'Torneo',                  icon: '🏆' },
  { v: 'amichevole',            l: 'Amichevole',              icon: '🤝' },
  { v: 'cerca_torneo',          l: 'Cerca Torneo',            icon: '🔍' },
  { v: 'cerca_amichevole',      l: 'Cerca Amichevole',        icon: '🤝' },
  { v: 'cerca_sponsor',         l: 'Cerca Sponsor',           icon: '🤝' },
  { v: 'offre_sponsorizzazione', l: 'Offre Sponsorizzazione', icon: '💼' },
  { v: 'gara', l: 'Gara', icon: '🏃' },
]

interface Props { adminId: string }

export default function CreaAnnuncioAdminClient({ adminId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [comuneSuggerimenti, setComuneSuggerimenti] = useState<string[]>([])

  const [form, setForm] = useState<any>({
    // Identità fittizia
    tipoUtente: 'societa',
    alias: '',
    nomeSocieta: '',
    // Annuncio
    tipo: '',
    sport: '',
    titolo: '',
    descrizione: '',
    ruoli: [],
    categoria: [],
    regione: '',
    comune: '',
    // Torneo
    nSquadreRicercate: '',
    dataInizio: '',
    dataFine: '',
    luogo: '',
    // Social
    linkFacebook: '',
    linkInstagram: '',
    linkYouTube: '',
    linkSito: '',
    // Stato
    chiuso: false,
  })

  const upd = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))
  const toggleArr = (k: string, v: string) => setForm((f: any) => ({
    ...f, [k]: f[k].includes(v) ? f[k].filter((x: string) => x !== v) : [...f[k], v],
  }))

  const handleComuneInput = (val: string) => {
    upd('comune', val)
    if (val.length >= 2) setComuneSuggerimenti(cercaComune(val).slice(0, 6))
    else setComuneSuggerimenti([])
  }

  const isTorneo = ['torneo', 'amichevole', 'cerca_torneo', 'cerca_amichevole'].includes(form.tipo)
  const ruoliDisp = form.sport ? RUOLI_PER_SPORT[form.sport as Sport] || [] : []
  const categorieDisp = CATEGORIE

  const salva = async () => {
    if (!form.tipo) return setError('Seleziona il tipo di annuncio')
    if (!form.titolo.trim()) return setError('Inserisci un titolo')
    if (!form.regione) return setError('Seleziona la regione')
    if (!form.comune.trim()) return setError('Inserisci il comune')
    if (!form.alias.trim()) return setError('Inserisci un alias visibile')

    setLoading(true); setError('')
    try {
      const payload = {
        ...form,
        // Usa un userId fittizio con prefisso admin_ così è identificabile
        userId: `admin_${adminId}_${Date.now()}`,
        isAdminCreated: true,
      }
      const res = await fetch('/api/annunci-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => router.push('/'), 2000)
      } else {
        setError(data.error || 'Errore durante la pubblicazione')
      }
    } catch { setError('Errore di rete') }
    setLoading(false)
  }

  if (success) return (
    <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', padding: 20 }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 700 }}>
        Annuncio pubblicato!
      </h2>
      <p style={{ color: '#6b7280' }}>Reindirizzamento alla homepage...</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Link href="/admin" style={{ color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
          <ArrowLeft size={15} /> Pannello admin
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <Shield size={22} style={{ color: 'var(--ms-green)' }} />
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 700, margin: 0 }}>
            Crea Annuncio (Admin)
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '3px 0 0' }}>
            Pubblica annunci con qualsiasi identità, alias e localizzazione
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* ── IDENTITÀ FITTIZIA ─────────────────────────────── */}
        <div style={{ background: '#fff', border: '1.5px solid #fde68a', borderRadius: 12, padding: '16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 12 }}>
            🎭 Identità dell'annuncio
          </div>

          {/* Tipo utente */}
          <div style={{ marginBottom: 12 }}>
            <label className="ms-label">Tipo utente</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TIPI_UTENTE.map(t => (
                <button key={t.v} type="button"
                  onClick={() => upd('tipoUtente', t.v)}
                  style={{ padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${form.tipoUtente === t.v ? '#d97706' : '#d0dde2'}`, background: form.tipoUtente === t.v ? '#fffbeb' : '#fff', color: form.tipoUtente === t.v ? '#d97706' : '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Barlow, sans-serif' }}>
                  {t.icon} {form.tipoUtente === t.v ? '✓ ' : ''}{t.l}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="ms-label">Alias visibile <span className="required">*</span></label>
              <input className="ms-input" value={form.alias}
                onChange={e => upd('alias', e.target.value)}
                placeholder="Es. ASD Torino FC, Marco R., Coach Bianchi..." />
            </div>
            {['societa', 'staff'].includes(form.tipoUtente) && (
              <div>
                <label className="ms-label">Nome Società / Studio</label>
                <input className="ms-input" value={form.nomeSocieta}
                  onChange={e => upd('nomeSocieta', e.target.value)}
                  placeholder="Es. ASD Juventus Academy" />
              </div>
            )}
          </div>
        </div>

        {/* ── LOCALIZZAZIONE ─────────────────────────────────── */}
        <div style={{ background: '#fff', border: '1.5px solid #d0dde2', borderRadius: 12, padding: '16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>
            📍 Localizzazione
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="ms-label">Regione <span className="required">*</span></label>
              <select className="ms-select" value={form.regione} onChange={e => upd('regione', e.target.value)}>
                <option value="">Seleziona regione</option>
                {REGIONI_ITALIA.filter(r => !r.startsWith('—')).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div style={{ position: 'relative' }}>
              <label className="ms-label">Comune <span className="required">*</span></label>
              <input className="ms-input" value={form.comune}
                onChange={e => handleComuneInput(e.target.value)}
                placeholder="Es. Torino, Milano, Firenze..." />
              {comuneSuggerimenti.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #d0dde2', borderRadius: 8, zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {comuneSuggerimenti.map(c => (
                    <div key={c} onClick={() => { upd('comune', c); setComuneSuggerimenti([]) }}
                      style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #f0f0f0' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fbfc')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                      📍 {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── TIPO ANNUNCIO ───────────────────────────────────── */}
        <div style={{ background: '#fff', border: '1.5px solid #d0dde2', borderRadius: 12, padding: '16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>
            📋 Tipo annuncio
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TUTTI_TIPI.map(t => (
              <button key={t.v} type="button"
                onClick={() => upd('tipo', t.v)}
                style={{ padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${form.tipo === t.v ? 'var(--ms-green)' : '#d0dde2'}`, background: form.tipo === t.v ? 'var(--ms-green-light)' : '#fff', color: form.tipo === t.v ? 'var(--ms-green)' : '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Barlow, sans-serif' }}>
                {t.icon} {form.tipo === t.v ? '✓ ' : ''}{t.l}
              </button>
            ))}
          </div>
        </div>

        {/* ── SPORT ───────────────────────────────────────────── */}
        <div>
          <label className="ms-label">Sport / Attività</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(Object.entries(SPORT_LABELS) as [Sport, string][]).map(([v, l]) => (
              <button key={v} type="button"
                onClick={() => { upd('sport', v); upd('ruoli', []); upd('categoria', []) }}
                style={{ padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${form.sport === v ? 'var(--ms-green)' : '#d0dde2'}`, background: form.sport === v ? 'var(--ms-green-light)' : '#fff', color: form.sport === v ? 'var(--ms-green)' : '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Barlow, sans-serif' }}>
                {SPORT_ICONS[v]} {form.sport === v ? '✓ ' : ''}{l}
              </button>
            ))}
          </div>
        </div>

        {/* ── TITOLO E DESCRIZIONE ────────────────────────────── */}
        <div>
          <label className="ms-label">Titolo <span className="required">*</span></label>
          <input className="ms-input" value={form.titolo}
            onChange={e => upd('titolo', e.target.value)}
            placeholder="Es. Portiere cerca squadra Serie D Piemonte" />
        </div>
        <div>
          <label className="ms-label">Descrizione</label>
          <textarea className="ms-input" rows={3}
            style={{ resize: 'vertical', fontFamily: 'Barlow, sans-serif' }}
            value={form.descrizione}
            onChange={e => upd('descrizione', e.target.value)}
            placeholder="Descrizione dettagliata dell'annuncio..."
            maxLength={500} />
          <span style={{ fontSize: 11, color: '#9ca3af', float: 'right' }}>{form.descrizione.length}/500</span>
        </div>

        {/* ── RUOLI ───────────────────────────────────────────── */}
        {ruoliDisp.length > 0 && (
          <div>
            <label className="ms-label">Ruoli</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ruoliDisp.map(r => (
                <button key={r} type="button"
                  onClick={() => toggleArr('ruoli', r)}
                  style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${form.ruoli.includes(r) ? 'var(--ms-green)' : '#d0dde2'}`, background: form.ruoli.includes(r) ? 'var(--ms-green-light)' : '#fff', color: form.ruoli.includes(r) ? 'var(--ms-green)' : '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Barlow, sans-serif' }}>
                  {form.ruoli.includes(r) ? '✓ ' : ''}{r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── CATEGORIE ───────────────────────────────────────── */}
        {categorieDisp.length > 0 && (
          <div>
            <label className="ms-label">Categorie</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {categorieDisp.map(c => (
                <button key={c} type="button"
                  onClick={() => toggleArr('categoria', c)}
                  style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${form.categoria.includes(c) ? '#d97706' : '#d0dde2'}`, background: form.categoria.includes(c) ? '#fffbeb' : '#fff', color: form.categoria.includes(c) ? '#d97706' : '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Barlow, sans-serif' }}>
                  {form.categoria.includes(c) ? '✓ ' : ''}{c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── DETTAGLI TORNEO ─────────────────────────────────── */}
        {isTorneo && (
          <div style={{ background: '#f8fbfc', border: '1px solid #d0dde2', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>🏆 Dettagli torneo/amichevole</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div>
                <label className="ms-label">N° squadre</label>
                <input type="number" className="ms-input" min={2} max={64}
                  value={form.nSquadreRicercate} onChange={e => upd('nSquadreRicercate', e.target.value)} placeholder="Es. 8" />
              </div>
              <div>
                <label className="ms-label">Sede/Luogo</label>
                <input className="ms-input" value={form.luogo} onChange={e => upd('luogo', e.target.value)} placeholder="Es. Campo Sportivo Comunale" />
              </div>
              <div>
                <label className="ms-label">Data inizio</label>
                <input type="date" className="ms-input" value={form.dataInizio} onChange={e => upd('dataInizio', e.target.value)} />
              </div>
              <div>
                <label className="ms-label">Data fine</label>
                <input type="date" className="ms-input" value={form.dataFine} onChange={e => upd('dataFine', e.target.value)} min={form.dataInizio} />
              </div>
            </div>
          </div>
        )}

        {/* ── LINK SOCIAL ─────────────────────────────────────── */}
        <div style={{ background: '#fff', border: '1.5px solid #e8f0f4', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a8a', marginBottom: 12 }}>
            🔗 Link Social & Media <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>(opzionali)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { k: 'linkFacebook', icon: '📘', label: 'Facebook', ph: 'https://facebook.com/...' },
              { k: 'linkInstagram', icon: '📸', label: 'Instagram', ph: 'https://instagram.com/...' },
              { k: 'linkYouTube', icon: '▶️', label: 'YouTube', ph: 'https://youtube.com/...' },
              { k: 'linkSito', icon: '🌐', label: 'Sito web', ph: 'https://www.tuosito.it' },
            ].map(({ k, icon, label, ph }) => (
              <div key={k}>
                <label className="ms-label">{icon} {label}</label>
                <input type="url" className="ms-input" value={form[k]}
                  onChange={e => upd(k, e.target.value)} placeholder={ph} />
              </div>
            ))}
          </div>
        </div>

        {/* ── STATO ANNUNCIO ──────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', background: '#f8fbfc', borderRadius: 10, border: '1px solid #e5e7eb' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.chiuso}
              onChange={e => upd('chiuso', e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#dc2626' }} />
            <span style={{ fontWeight: 500 }}>🔒 Annuncio "Non disponibile" (chat chiusa)</span>
          </label>
        </div>

        {/* Errore */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Bottoni */}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4 }}>
          <Link href="/admin" className="btn-ghost" style={{ textDecoration: 'none' }}>
            ← Annulla
          </Link>
          <button className="btn-primary" onClick={salva} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 28px' }}>
            {loading ? <><Loader2 size={15} className="spinner" /> Pubblicazione...</>
              : <><Send size={15} /> Pubblica annuncio</>}
          </button>
        </div>

      </div>
    </div>
  )
}
