'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ChevronLeft, Check, User, Building2, UserCog, Loader2, AlertCircle } from 'lucide-react'
import { SPORT_LABELS, RUOLI_PER_SPORT, CATEGORIE, REGIONI_ITALIA, REGIONI_ITALIA_SELECT } from '@/types'
import type { Sport } from '@/types'

type TipoReg = 'atleta' | 'societa' | 'staff'

import RegoleCommunity from '@/components/RegolaComunnity'

export default function RegistrazionePage() {
  const router = useRouter()
  const [tipo, setTipo] = useState<TipoReg | null>(null)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState<Record<string, any>>({
    privacyAccettata: false,
    regolaAccettata: false,
    mostraAliasInChat: true,
    sport: [],
    ruoli: [],
    categoria: [],
    mostraNomeSocieta: false,
    qualifiche: [],
    liberoProf: false,
  })

  const upd = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }))

  const toggleArr = (key: string, val: string) =>
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((x: string) => x !== val) : [...f[key], val],
    }))

  const isMinorenne = () => {
    if (!form.dataNascita) return false
    const oggi = new Date()
    const nascita = new Date(form.dataNascita)
    let eta = oggi.getFullYear() - nascita.getFullYear()
    const mese = oggi.getMonth() - nascita.getMonth()
    if (mese < 0 || (mese === 0 && oggi.getDate() < nascita.getDate())) eta--
    return eta < 18
  }

  // Validazione step 1
  const validaStep1 = (): string => {
    if (!form.alias || form.alias.length < 3) return 'Alias: minimo 3 caratteri'
    if (!/^[a-zA-Z0-9_]+$/.test(form.alias)) return 'Alias: solo lettere, numeri e _'
    if (!form.nome || form.nome.length < 2) return 'Nome obbligatorio'
    if (!form.cognome || form.cognome.length < 2) return 'Cognome obbligatorio'
    if (!form.dataNascita) return 'Data di nascita obbligatoria'
    if (!form.codiceFiscale || form.codiceFiscale.length !== 16) return 'Codice fiscale: 16 caratteri'
    if (!form.email || !form.email.includes('@')) return 'Email non valida'
    if (!form.telefono || form.telefono.length < 9) return 'Telefono non valido'
    if (!form.password || form.password.length < 8) return 'Password: minimo 8 caratteri'
    if (tipo === 'societa' && !form.nomeSocieta) return 'Nome società obbligatorio'
    if (tipo === 'societa' && !form.ruoloSocietario) return 'Ruolo societario obbligatorio'
    return ''
  }

  // Validazione step 2
  const validaStep2 = (): string => {
    if (!form.regione) return 'Regione obbligatoria'
    if (!form.comune) return 'Comune obbligatorio'
    if (!form.sport || form.sport.length === 0) return 'Seleziona almeno uno sport'
    if (!form.sportPrimario) return 'Seleziona lo sport primario'
    if (tipo !== 'societa' && (!form.ruoli || form.ruoli.length === 0)) return 'Seleziona almeno un ruolo'
    if (tipo !== 'societa' && (!form.categoria || form.categoria.length === 0)) return 'Seleziona almeno una categoria'
    return ''
  }

  const avanti = () => {
    if (step === 1) {
      const err = validaStep1()
      if (err) { setError(err); return }
    }
    if (step === 2) {
      const err = validaStep2()
      if (err) { setError(err); return }
    }
    setError('')
    setStep(s => s + 1)
  }

  const submit = async () => {
    if (!form.regolaAccettata) {
      return 'Devi accettare le Regole della Community'
    }
    if (!form.privacyAccettata) {
      setError('Devi accettare la privacy per continuare')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, tipo }
      console.log('Invio payload:', JSON.stringify(payload, null, 2))
      const res = await fetch('/api/users/registrazione', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Errore nella registrazione')
      }
    } catch {
      setError('Errore di connessione. Riprova.')
    }
    setLoading(false)
  }

  if (success) return <SuccessScreen />

  // Selezione tipo
  if (!tipo) return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 580 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 700, textAlign: 'center', margin: '0 0 8px' }}>
          Registrati su Mondo Sport
        </h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 32 }}>Seleziona il tipo di account</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { t: 'atleta' as TipoReg, icon: <User size={28} />, label: 'Atleta', desc: 'Giocatore in cerca di squadra o di proposte' },
            { t: 'societa' as TipoReg, icon: <Building2 size={28} />, label: 'Società', desc: 'ASD, SSD o società sportiva' },
            { t: 'staff' as TipoReg, icon: <UserCog size={28} />, label: 'Staff tecnico', desc: 'Allenatore, preparatore, dirigente' },
          ].map(({ t, icon, label, desc }) => (
            <button key={t} onClick={() => { setTipo(t); setStep(1) }}
              style={{ background: '#fff', border: '2px solid #e5e7eb', borderRadius: 12, padding: '20px 16px', cursor: 'pointer', textAlign: 'center', fontFamily: 'Barlow, sans-serif', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ms-green)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,107,58,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ color: 'var(--ms-green)', marginBottom: 10 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>{desc}</div>
            </button>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6b7280' }}>
          Hai già un account?{' '}
          <Link href="/accedi" style={{ color: 'var(--ms-green)', fontWeight: 600, textDecoration: 'none' }}>Accedi</Link>
        </p>
      </div>
    </div>
  )

  const steps = ['Tipo', 'Dati personali', 'Dati sportivi', 'Privacy']
  const min = tipo === 'atleta' && isMinorenne()

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--ms-bg)' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 28 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background: i < step ? 'var(--ms-green)' : i === step ? 'var(--ms-green)' : '#e5e7eb',
                color: i <= step ? '#fff' : '#9ca3af',
              }}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: 12, color: i === step ? 'var(--ms-green)' : '#9ca3af', fontWeight: i === step ? 600 : 400, whiteSpace: 'nowrap' }}>
                {s}
              </span>
              {i < steps.length - 1 && <div style={{ width: 20, height: 2, background: i < step ? 'var(--ms-green)' : '#e5e7eb', borderRadius: 1 }} />}
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 28 }}>

          {/* Errore */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: Dati personali ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>
                {tipo === 'societa' ? 'Dati della società' : 'Dati personali'}
              </h2>

              {tipo === 'societa' && (
                <Field label="Nome società" required>
                  <input className="ms-input" value={form.nomeSocieta || ''} onChange={e => upd('nomeSocieta', e.target.value)} placeholder="Es. ASD Sporting Club Torino" />
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '6px 0 0', lineHeight: 1.5, padding: '8px 10px', background: '#f0f7fa', borderRadius: 6, border: '1px solid #d0dde2' }}>
                    💡 Più persone della stessa società possono registrarsi separatamente con i propri dati personali usando lo stesso nome società. Ogni persona gestirà i propri annunci in autonomia.
                  </p>
                </Field>
              )}

              <Field label="Alias pubblico" required hint="Solo lettere, numeri e _ — sarà il tuo nome visibile">
                <input className="ms-input" value={form.alias || ''} onChange={e => upd('alias', e.target.value)} placeholder="Es. Marco_Rossi99" />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Nome" required>
                  <input className="ms-input" value={form.nome || ''} onChange={e => upd('nome', e.target.value)} />
                </Field>
                <Field label="Cognome" required>
                  <input className="ms-input" value={form.cognome || ''} onChange={e => upd('cognome', e.target.value)} />
                </Field>
              </div>

              <Field label="Data di nascita" required>
                <input type="date" className="ms-input" value={form.dataNascita || ''} onChange={e => upd('dataNascita', e.target.value)} max={new Date().toISOString().split('T')[0]} />
              </Field>

              <Field label="Codice fiscale" required>
                <input className="ms-input" value={form.codiceFiscale || ''} onChange={e => upd('codiceFiscale', e.target.value.toUpperCase())} maxLength={16} placeholder="RSSMRC80A01H501T" style={{ textTransform: 'uppercase', letterSpacing: '1px' }} />
              </Field>

              <Field label="Email" required>
                <input type="email" className="ms-input" value={form.email || ''} onChange={e => upd('email', e.target.value)} placeholder="nome@email.it" />
              </Field>

              <Field label="Numero di cellulare" required>
                <input type="tel" className="ms-input" value={form.telefono || ''} onChange={e => upd('telefono', e.target.value)} placeholder="+39 333 1234567" />
              </Field>

              <Field label="Password" required hint="Minimo 8 caratteri">
                <input type="password" className="ms-input" value={form.password || ''} onChange={e => upd('password', e.target.value)} placeholder="••••••••" />
              </Field>

              {tipo === 'societa' && (
                <Field label="Ruolo in società" required>
                  <select className="ms-select" value={form.ruoloSocietario || ''} onChange={e => upd('ruoloSocietario', e.target.value)}>
                    <option value="">Seleziona il tuo ruolo</option>
                    {['Presidente', 'Vicepresidente', 'Direttore sportivo', 'Dirigente', 'Segretario', 'Team manager', 'Responsabile settore giovanile', 'Altro'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>
              )}

              {tipo === 'staff' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={form.liberoProf} onChange={e => upd('liberoProf', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--ms-green)' }} />
                  Sono un libero professionista
                </label>
              )}

              {/* Genitore se minorenne */}
              {min && (
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: 16 }}>
                  <p style={{ fontWeight: 700, color: '#92400e', margin: '0 0 12px', fontSize: 14 }}>⚠️ Utente minorenne — Dati genitore/tutore richiesti</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <Field label="Nome genitore" required><input className="ms-input" style={{ fontSize: 13 }} value={form.genitore?.nome || ''} onChange={e => upd('genitore', { ...form.genitore, nome: e.target.value })} /></Field>
                      <Field label="Cognome genitore" required><input className="ms-input" style={{ fontSize: 13 }} value={form.genitore?.cognome || ''} onChange={e => upd('genitore', { ...form.genitore, cognome: e.target.value })} /></Field>
                    </div>
                    <Field label="Data di nascita genitore" required><input type="date" className="ms-input" style={{ fontSize: 13 }} value={form.genitore?.dataNascita || ''} onChange={e => upd('genitore', { ...form.genitore, dataNascita: e.target.value })} /></Field>
                    <Field label="Codice fiscale genitore" required><input className="ms-input" style={{ fontSize: 13, textTransform: 'uppercase' }} maxLength={16} value={form.genitore?.codiceFiscale || ''} onChange={e => upd('genitore', { ...form.genitore, codiceFiscale: e.target.value.toUpperCase() })} /></Field>
                    <Field label="Email genitore" required><input type="email" className="ms-input" style={{ fontSize: 13 }} value={form.genitore?.email || ''} onChange={e => upd('genitore', { ...form.genitore, email: e.target.value })} /></Field>
                    <Field label="Telefono genitore" required><input type="tel" className="ms-input" style={{ fontSize: 13 }} value={form.genitore?.telefono || ''} onChange={e => upd('genitore', { ...form.genitore, telefono: e.target.value })} /></Field>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Dati sportivi ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Dati sportivi</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Regione" required>
                  <select className="ms-select" value={form.regione || ''} onChange={e => upd('regione', e.target.value)}>
                    <option value="">Seleziona regione</option>
                    {REGIONI_ITALIA_SELECT.map(r => { const isPromo = r.startsWith('—'); return <option key={r} value={isPromo ? '' : r} disabled={isPromo} style={{ color: isPromo ? '#9ca3af' : 'inherit', fontStyle: isPromo ? 'italic' : 'normal' }}>{r}</option> })}
                  </select>
                </Field>
                <Field label="Comune" required>
                  <input className="ms-input" value={form.comune || ''} onChange={e => upd('comune', e.target.value)} placeholder="Es. Torino" />
                </Field>
              </div>

              <Field label="Sport praticati" required>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {tipo === 'staff' && (
                    <button type="button" onClick={() => {
                      if (form.sport.length === Object.keys(SPORT_LABELS).length) {
                        upd('sport', []); upd('sportPrimario', '')
                      } else {
                        upd('sport', Object.keys(SPORT_LABELS)); upd('sportPrimario', 'calcio')
                      }
                    }}
                      style={{ padding: '6px 16px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer', fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 13, borderColor: form.sport.length === Object.keys(SPORT_LABELS).length ? '#e8a030' : '#e5e7eb', background: form.sport.length === Object.keys(SPORT_LABELS).length ? '#fef3e2' : 'transparent', color: form.sport.length === Object.keys(SPORT_LABELS).length ? '#c07820' : '#6b7280' }}>
                      {form.sport.length === Object.keys(SPORT_LABELS).length ? '✓ ' : ''}Tutti gli sport
                    </button>
                  )}
                  {(Object.entries(SPORT_LABELS) as [Sport, string][]).map(([v, l]) => (
                    <button key={v} type="button" onClick={() => {
                      toggleArr('sport', v)
                      if (form.sportPrimario === v) upd('sportPrimario', '')
                    }}
                      style={{ padding: '6px 16px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 13, transition: 'all 0.12s', borderColor: form.sport.includes(v) ? 'var(--ms-green)' : '#e5e7eb', background: form.sport.includes(v) ? 'var(--ms-green-light)' : 'transparent', color: form.sport.includes(v) ? 'var(--ms-green)' : '#6b7280' }}>
                      {form.sport.includes(v) ? '✓ ' : ''}{l}
                    </button>
                  ))}
                </div>
              </Field>

              {form.sport.length > 0 && (
                <Field label="Sport primario" required>
                  <select className="ms-select" value={form.sportPrimario || ''} onChange={e => { upd('sportPrimario', e.target.value); upd('ruoli', []) }}>
                    <option value="">Seleziona sport primario</option>
                    {form.sport.map((s: string) => <option key={s} value={s}>{SPORT_LABELS[s as Sport]}</option>)}
                  </select>
                </Field>
              )}

              {form.sportPrimario && tipo !== 'societa' && (
                <Field label="Ruoli" required hint="Puoi selezionarne più di uno">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {RUOLI_PER_SPORT[form.sportPrimario as Sport].map(r => (
                      <button key={r} type="button" onClick={() => toggleArr('ruoli', r)}
                        style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid', cursor: 'pointer', fontFamily: 'Barlow, sans-serif', fontSize: 12, transition: 'all 0.12s', borderColor: form.ruoli.includes(r) ? 'var(--ms-green)' : '#e5e7eb', background: form.ruoli.includes(r) ? 'var(--ms-green-light)' : 'transparent', color: form.ruoli.includes(r) ? 'var(--ms-green)' : '#374151', fontWeight: form.ruoli.includes(r) ? 600 : 400 }}>
                        {form.ruoli.includes(r) ? '✓ ' : ''}{r}
                      </button>
                    ))}
                  </div>
                </Field>
              )}

              {tipo !== 'societa' && (<Field label="Categorie" required hint="Seleziona le categorie in cui sei disponibile">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {CATEGORIE.map(c => (
                    <button key={c} type="button" onClick={() => toggleArr('categoria', c)}
                      style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid', cursor: 'pointer', fontFamily: 'Barlow, sans-serif', fontSize: 12, transition: 'all 0.12s', borderColor: form.categoria.includes(c) ? '#d97706' : '#e5e7eb', background: form.categoria.includes(c) ? '#fef3c7' : 'transparent', color: form.categoria.includes(c) ? '#92400e' : '#374151', fontWeight: form.categoria.includes(c) ? 600 : 400 }}>
                      {c}
                    </button>
                  ))}
                </div>
              </Field>)}

              {tipo === 'societa' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <input type="checkbox" checked={form.mostraNomeSocieta} onChange={e => upd('mostraNomeSocieta', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--ms-green)' }} />
                  <span>Mostra il nome della società in chat (invece dell'alias)</span>
                </label>
              )}
            </div>
          )}

          {/* ── STEP 3: Privacy ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Privacy e conferma</h2>

              {/* Riepilogo */}
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14 }}>
                <p style={{ fontWeight: 600, fontSize: 13, margin: '0 0 8px' }}>Riepilogo registrazione</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 13 }}>
                  {[
                    { l: 'Alias', v: form.alias },
                    { l: 'Tipo', v: tipo },
                    { l: 'Sport', v: (form.sport as string[]).map(s => SPORT_LABELS[s as Sport]).join(', ') },
                    { l: 'Regione', v: form.regione },
                    { l: 'Comune', v: form.comune },
                    ...(tipo !== 'societa' ? [{ l: 'Ruoli', v: (form.ruoli as string[]).join(', ') }] : []),
                  ].map(({ l, v }) => v ? (
                    <div key={l}>
                      <span style={{ color: '#9ca3af', fontSize: 11 }}>{l}: </span>
                      <span style={{ color: '#374151', fontWeight: 500 }}>{v}</span>
                    </div>
                  ) : null)}
                </div>
              </div>

              <div style={{ background: '#f9fafb', borderRadius: 10, padding: 14, fontSize: 13, color: '#374151', lineHeight: 1.7, maxHeight: 180, overflowY: 'auto', border: '1px solid #e5e7eb' }}>
                <strong style={{ display: 'block', marginBottom: 6 }}>Regole della Community Mondo Sport</strong>
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                  <RegoleCommunity />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '12px 14px', background: form.regolaAccettata ? 'var(--ms-green-light)' : '#f9fafb', border: `1.5px solid ${form.regolaAccettata ? 'var(--ms-green)' : '#e5e7eb'}`, borderRadius: 10, transition: 'all 0.15s' }}>
                <input type="checkbox" checked={form.regolaAccettata} onChange={e => upd('regolaAccettata', e.target.checked)} style={{ marginTop: 2, width: 18, height: 18, accentColor: 'var(--ms-green)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, lineHeight: 1.5 }}>
                  Ho letto e accetto le <strong>Regole della Community</strong>. Mi impegno a usare Mondo Sport solo per scopi sportivi e a mantenere un comportamento rispettoso. <span style={{ color: '#dc2626' }}>*</span>
                </span>
              </label>

              <div style={{ background: '#f9fafb', borderRadius: 10, padding: 14, fontSize: 13, color: '#374151', lineHeight: 1.7, maxHeight: 180, overflowY: 'auto', border: '1px solid #e5e7eb' }}>
                <strong style={{ display: 'block', marginBottom: 6 }}>Informativa sul trattamento dei dati personali</strong>
                <p style={{ margin: '0 0 8px' }}>Il responsabile del trattamento è <strong>Mondo Sport</strong>. I dati personali sono raccolti esclusivamente per la gestione dell'account e non vengono ceduti a terzi.</p>
                <p style={{ margin: '0 0 8px' }}><strong>Dati pubblici:</strong> alias, anno di nascita, comune, sport, ruoli, categorie.</p>
                <p style={{ margin: 0 }}><strong>Dati privati</strong> (solo admin): nome, cognome, data nascita, CF, email, telefono. Per info: <strong>info.mondo2026@gmail.com</strong></p>
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '12px 14px', background: form.privacyAccettata ? 'var(--ms-green-light)' : '#f9fafb', border: `1.5px solid ${form.privacyAccettata ? 'var(--ms-green)' : '#e5e7eb'}`, borderRadius: 10, transition: 'all 0.15s' }}>
                <input type="checkbox" checked={form.privacyAccettata} onChange={e => upd('privacyAccettata', e.target.checked)} style={{ marginTop: 2, width: 18, height: 18, accentColor: 'var(--ms-green)', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>
                  Ho letto e accetto il trattamento dei miei dati personali come descritto nell'informativa sulla privacy. <span style={{ color: '#dc2626' }}>*</span>
                </span>
              </label>

              <div style={{ background: '#e8f5ee', borderRadius: 10, padding: 14, fontSize: 13, color: '#1a6b3a', border: '1px solid #bbf7d0' }}>
                <strong style={{ display: 'block', marginBottom: 6 }}>Cosa succede dopo?</strong>
                <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
                  <li>Ricevi email di verifica (se SMTP configurato)</li>
                  <li>L'amministratore revisiona il tuo account</li>
                  <li>Ricevi email di conferma approvazione</li>
                  <li>Accedi e inizia a contattare atleti e società</li>
                </ol>
              </div>
            </div>
          )}

          {/* Navigazione */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
            <button type="button" className="btn-ghost" onClick={() => { setError(''); step > 1 ? setStep(s => s - 1) : setTipo(null) }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ChevronLeft size={16} /> Indietro
            </button>
            {step < 3 ? (
              <button type="button" className="btn-primary" onClick={avanti} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Avanti <ChevronRight size={16} />
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={submit} disabled={!form.privacyAccettata || !form.regolaAccettata || loading} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: (!form.privacyAccettata || !form.regolaAccettata) ? 0.5 : 1 }}>
                {loading ? <><Loader2 size={16} className="spinner" /> Invio...</> : <><Check size={16} /> Registrati</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="ms-label">
        {label} {required && <span className="required">*</span>}
      </label>
      {hint && <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{hint}</p>}
      {children}
    </div>
  )
}

function SuccessScreen() {
  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--ms-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Check size={36} style={{ color: 'var(--ms-green)' }} />
        </div>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>Registrazione completata!</h1>
        <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6, margin: '0 0 8px' }}>
          Il tuo account è stato creato ed è in attesa di approvazione dall'amministratore.
        </p>
        <p style={{ color: '#9ca3af', fontSize: 13, margin: '0 0 24px' }}>
          Riceverai una notifica email non appena sarà approvato.
        </p>
        <Link href="/" className="btn-primary" style={{ display: 'inline-flex' }}>Torna alla homepage</Link>
      </div>
    </div>
  )
}
