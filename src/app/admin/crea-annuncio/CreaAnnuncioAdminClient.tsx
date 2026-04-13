'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Loader2, Check, Shield, X, Plus } from 'lucide-react'
import { SPORT_LABELS, SPORT_ICONS, RUOLI_PER_SPORT, CATEGORIE, REGIONI_ITALIA } from '@/types'
import type { Sport, TipoAnnuncio } from '@/types'
import { cercaComune } from '@/lib/comuni'

const TIPI_UTENTE = [
  { v: 'atleta',   l: 'Atleta',                icon: '🏃' },
  { v: 'societa',  l: 'Società Sportiva',       icon: '🏛' },
  { v: 'staff',    l: 'Staff / Libero Prof.',   icon: '👨\u200d💼' },
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

// ── Tipi media Google Drive ───────────────────────────────────────────────────
interface DriveMedia {
  url: string
  tipo: 'video' | 'immagine' | 'pdf'
  titolo: string
}

function rilevaTipo(url: string): 'video' | 'immagine' | 'pdf' {
  const u = url.toLowerCase()
  if (u.includes('.pdf') || u.includes('pdf')) return 'pdf'
  if (u.includes('.mp4') || u.includes('.mov') || u.includes('.avi') || u.includes('video')) return 'video'
  return 'immagine'
}

function isValidDriveUrl(url: string): boolean {
  if (!url.trim()) return false
  return url.includes('drive.google.com') || url.includes('docs.google.com')
}
// ─────────────────────────────────────────────────────────────────────────────

interface Props { adminId: string }

export default function CreaAnnuncioAdminClient({ adminId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [comuneSuggerimenti, setComuneSuggerimenti] = useState<string[]>([])

  const [form, setForm] = useState<any>({
    tipoUtente: 'societa',
    alias: '',
    nomeSocieta: '',
    tipo: '',
    sport: '',
    titolo: '',
    descrizione: '',
    ruoli: [],
    categoria: [],
    regione: '',
    comune: '',
    nSquadreRicercate: '',
    dataInizio: '',
    dataFine: '',
    luogo: '',
    linkFacebook: '',
    linkInstagram: '',
    linkYouTube: '',
    linkSito: '',
    chiuso: false,
  })

  // ── Stato media Google Drive ──────────────────────────────────────────────
  const [driveMedia, setDriveMedia] = useState<DriveMedia[]>([
    { url: '', tipo: 'immagine', titolo: '' }
  ])
  const [driveErrors, setDriveErrors] = useState<string[]>([''])

  const addDriveMedia = () => {
    if (driveMedia.length < 5) {
      setDriveMedia(p => [...p, { url: '', tipo: 'immagine', titolo: '' }])
      setDriveErrors(p => [...p, ''])
    }
  }
  const removeDriveMedia = (i: number) => {
    setDriveMedia(p => p.filter((_, idx) => idx !== i))
    setDriveErrors(p => p.filter((_, idx) => idx !== i))
  }
  const updateDriveMedia = (i: number, field: keyof DriveMedia, val: string) => {
    setDriveMedia(p => p.map((m, idx) => {
      if (idx !== i) return m
      const updated = { ...m, [field]: val }
      if (field === 'url' && val.trim()) updated.tipo = rilevaTipo(val)
      return updated
    }))
    if (field === 'url') {
      setDriveErrors(p => p.map((e, idx) => {
        if (idx !== i) return e
        if (!val.trim()) return ''
        return isValidDriveUrl(val) ? '' : 'Inserisci un link Google Drive valido'
      }))
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

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

    const mediaValidi = driveMedia.filter(m => m.url.trim())
    const linkInvalidi = mediaValidi.filter(m => !isValidDriveUrl(m.url))
    if (linkInvalidi.length > 0) {
      setError('Uno o più link Google Drive non sono validi')
      return
    }

    setLoading(true); setError('')
    try {
      const payload = {
        ...form,
        userId: `admin_${adminId}_${Date.now()}`,
        isAdminCreated: true,
        mediaGoogleDrive: mediaValidi.map(m => ({
          url: m.url.trim(),
          tipo: m.tipo,
          titolo: m.titolo.trim(),
        })),
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
                {REGIONI_ITALIA.filter((r: string) => !r.startsWith('—')).map((r: string) => (
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
              {ruoliDisp.map((r: string) => (
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
              {categorieDisp.map((c: string) => (
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

        {/* ── MEDIA GOOGLE DRIVE ──────────────────────────────── */}
        <div style={{ background: '#f8f4ff', border: '1.5px solid #d8b4fe', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 20 }}>📁</span>
            <div>
              <span style={{ fontWeight: 700, color: '#6d28d9', fontSize: 14 }}>Video, Foto e PDF da Google Drive</span>
              <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>(opzionali, max 5)</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 14, lineHeight: 1.6 }}>
            Carica i file su Google Drive, aprili e clicca <strong>Condividi → Chiunque con il link</strong>, poi incolla il link qui sotto.
          </p>

          {driveMedia.map((m, i) => (
            <div key={i} style={{ marginBottom: 12, background: '#fff', borderRadius: 10, border: '1px solid #e9d5ff', padding: '12px 14px' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={m.url}
                  onChange={e => updateDriveMedia(i, 'url', e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', border: `1.5px solid ${driveErrors[i] ? '#fca5a5' : '#d8b4fe'}`, borderRadius: 8, fontSize: 13, outline: 'none', background: '#faf5ff', fontFamily: 'Barlow, sans-serif' }}
                />
                {driveMedia.length > 1 && (
                  <button type="button" onClick={() => removeDriveMedia(i)}
                    style={{ padding: '8px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
              {driveErrors[i] && (
                <p style={{ fontSize: 11, color: '#dc2626', margin: '0 0 8px' }}>⚠️ {driveErrors[i]}</p>
              )}
              {m.url.trim() && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>Tipo file</label>
                    <select
                      value={m.tipo}
                      onChange={e => updateDriveMedia(i, 'tipo', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 7, border: '1px solid #d8b4fe', fontSize: 12, background: '#faf5ff', color: '#374151', cursor: 'pointer' }}
                    >
                      <option value="immagine">🖼️ Immagine / Foto</option>
                      <option value="video">🎬 Video</option>
                      <option value="pdf">📄 PDF</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>Titolo (opzionale)</label>
                    <input
                      type="text"
                      placeholder="Es. Video highlights, Brochure società..."
                      value={m.titolo}
                      onChange={e => updateDriveMedia(i, 'titolo', e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: 7, border: '1px solid #d8b4fe', fontSize: 12, background: '#faf5ff', fontFamily: 'Barlow, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {driveMedia.length < 5 && (
            <button type="button" onClick={addDriveMedia}
              style={{ padding: '8px 16px', background: '#ede9fe', color: '#6d28d9', border: '1.5px dashed #a78bfa', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Barlow, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Aggiungi altro file
            </button>
          )}
        </div>

        {/* ── LINK SOCIAL ─────────────────────────────────────── */}
        <div style={{ background: '#fff', border: '1.5px solid #e8f0f4', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a8a', marginBottom: 12 }}>
            🔗 Link Social &amp; Media <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>(opzionali)</span>
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
