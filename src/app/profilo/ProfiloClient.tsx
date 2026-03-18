'use client'
import { useState } from 'react'
import Link from 'next/link'
import { User, Bell, Eye, Check, Trash2, MapPin, Shield, MessageCircle, FileText, ChevronRight } from 'lucide-react'
import { SPORT_LABELS } from '@/types'
import type { AlertConfig } from '@/types'

interface ProfiloClientProps {
  utente: any
  alerts: AlertConfig[]
}

export default function ProfiloClient({ utente, alerts: initialAlerts }: ProfiloClientProps) {
  const [tab, setTab] = useState<'profilo' | 'visibilita' | 'alert' | 'privacy'>('profilo')
  const [alerts, setAlerts] = useState(initialAlerts)
  const [statoAnnuncio, setStatoAnnuncio] = useState(utente.statoAnnuncio)
  const [mostraAlias, setMostraAlias] = useState(utente.mostraAliasInChat)
  const [nascondiRuolo, setNascondiRuolo] = useState(utente.nascondiRuolo || false)
  const [descrizione, setDescrizione] = useState(utente.descrizione || '')
  const [notificheEmailChat, setNotificheEmailChat] = useState(utente.notificheEmailChat !== false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const salvaImpostazioni = async (updates: any) => {
    setSaving(true)
    await fetch('/api/users/profilo', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const eliminaAlert = async (alertId: string) => {
    await fetch('/api/alerts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId }),
    })
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--ms-green-light)', color: 'var(--ms-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 700,
        }}>
          {utente.alias[0].toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 700, margin: 0 }}>
            {utente.alias}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
              background: 'var(--ms-green-light)', color: 'var(--ms-green)', padding: '2px 8px', borderRadius: 10,
            }}>
              {utente.tipo === 'atleta' ? 'Atleta' : utente.tipo === 'societa' ? 'Società' : 'Staff'}
            </span>
            <span style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={11} /> {utente.comune}, {utente.regione}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
        {[
          { id: 'profilo', label: 'Profilo', icon: <User size={14} /> },
          { id: 'visibilita', label: 'Visibilità', icon: <Eye size={14} /> },
          { id: 'alert', label: `Alert (${alerts.length})`, icon: <Bell size={14} /> },
          { id: 'privacy', label: 'Privacy', icon: <Shield size={14} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t.id ? 'var(--ms-green)' : 'transparent'}`,
              color: tab === t.id ? 'var(--ms-green)' : '#6b7280',
              fontWeight: tab === t.id ? 600 : 400, fontSize: 14,
              cursor: 'pointer', fontFamily: 'Barlow, sans-serif',
              marginBottom: -1,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Profilo */}
      {tab === 'profilo' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Dati pubblici */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: 15, margin: '0 0 16px', color: '#111' }}>Dati pubblici</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { l: 'Alias', v: utente.alias },
                { l: 'Anno di nascita', v: utente.annoDiNascita },
                { l: 'Comune', v: utente.comune },
                { l: 'Regione', v: utente.regione },
                { l: 'Sport', v: utente.sport.map((s: string) => SPORT_LABELS[s as keyof typeof SPORT_LABELS] || s).join(', ') },
                { l: 'Ruoli', v: utente.ruoli.join(', ') },
                { l: 'Categorie', v: utente.categoria.join(', ') },
              ].map(({ l, v }) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{l}</span>
                  <span style={{ fontSize: 13, color: '#111', textAlign: 'right', maxWidth: '60%' }}>{String(v)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dati privati */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: 15, margin: '0 0 4px', color: '#111' }}>Dati privati</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 16px' }}>Visibili solo all'amministratore</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { l: 'Nome completo', v: `${utente.nome} ${utente.cognome}` },
                { l: 'Data di nascita', v: utente.dataNascita },
                { l: 'Email', v: utente.email, verified: utente.emailVerificato },
                { l: 'Telefono', v: utente.telefono },
                { l: 'Codice fiscale', v: utente.codiceFiscale },
              ].map(({ l, v, verified }) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{l}</span>
                  <span style={{ fontSize: 13, color: '#111', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {String(v)}
                    {verified === true && <Check size={12} style={{ color: '#059669' }} />}
                    {verified === false && <span style={{ fontSize: 10, color: '#f59e0b' }}>Non verificata</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Visibilità */}
      {tab === 'visibilita' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>

          {/* Curriculum link card */}
          <Link href="/profilo/curriculum" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, var(--ms-green) 0%, var(--ms-green-dark) 100%)',
            borderRadius: 12, padding: '16px 20px', textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} style={{ color: '#fff' }} />
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Curriculum Sportivo</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Esperienze, titoli, qualifiche — visibile nella versione Premium</div>
              </div>
            </div>
            <ChevronRight size={20} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </Link>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontWeight: 600, fontSize: 16, margin: '0 0 20px' }}>Impostazioni visibilità</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Stato annuncio */}
              <div>
                <label className="ms-label">Il mio stato</label>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 10px' }}>
                  Controlla se il tuo profilo è visibile agli altri utenti
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { v: 'disponibile', l: '● Disponibile', desc: 'Visibile — sono disponibile per contatti', color: '#059669', bg: '#d1fae5' },
                    { v: 'cerca', l: '● Cerco squadra', desc: 'Visibile — sto cercando attivamente', color: '#2563eb', bg: '#dbeafe' },
                    { v: 'nascosto', l: '○ Non visibile', desc: 'Il tuo profilo non compare negli annunci', color: '#6b7280', bg: '#f3f4f6' },
                  ].map(opt => (
                    <label key={opt.v} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                      border: `1.5px solid ${statoAnnuncio === opt.v ? opt.color : '#e5e7eb'}`,
                      borderRadius: 10, cursor: 'pointer',
                      background: statoAnnuncio === opt.v ? opt.bg : '#fff',
                      transition: 'all 0.15s',
                    }}>
                      <input type="radio" name="stato" value={opt.v}
                        checked={statoAnnuncio === opt.v}
                        onChange={() => setStatoAnnuncio(opt.v)}
                        style={{ accentColor: opt.color }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: opt.color }}>{opt.l}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Descrizione annuncio */}
              <div>
                <label className="ms-label">Descrizione annuncio</label>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 8px' }}>
                  Breve testo visibile sulla tua card — max 140 caratteri
                </p>
                <textarea
                  className="ms-input"
                  rows={3}
                  maxLength={140}
                  style={{ resize: 'none', fontFamily: 'Barlow, sans-serif', fontSize: 13 }}
                  value={descrizione}
                  onChange={e => setDescrizione(e.target.value)}
                  placeholder="Es. Centrocampista con 10 anni di esperienza in Eccellenza, cerco squadra per la prossima stagione..."
                />
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0', textAlign: 'right' }}>
                  {descrizione.length}/140
                </p>
              </div>

              {/* Nascondi ruolo */}
              <div>
                <label className="ms-label">Visibilità del ruolo</label>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 10px' }}>
                  Scegli se mostrare il tuo ruolo nella card dell'annuncio
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { v: false, l: 'Mostra ruolo', desc: 'Il tuo ruolo è visibile nella card annuncio', icon: <Eye size={16} /> },
                    { v: true, l: 'Nascondi ruolo', desc: 'Il ruolo non compare nella card — più privacy', icon: <Shield size={16} /> },
                  ].map(opt => (
                    <label key={String(opt.v)} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                      border: `1.5px solid ${nascondiRuolo === opt.v ? 'var(--ms-green)' : '#e5e7eb'}`,
                      borderRadius: 10, cursor: 'pointer',
                      background: nascondiRuolo === opt.v ? 'var(--ms-green-light)' : '#fff',
                    }}>
                      <input type="radio" name="nascondiRuolo"
                        checked={nascondiRuolo === opt.v}
                        onChange={() => setNascondiRuolo(opt.v)}
                        style={{ accentColor: 'var(--ms-green)' }} />
                      <div style={{ color: 'var(--ms-green)', flexShrink: 0 }}>{opt.icon}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{opt.l}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Identità in chat */}
              <div>
                <label className="ms-label">Identità in chat</label>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 10px' }}>
                  Come appari nelle conversazioni
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { v: true, l: 'Usa alias', desc: `Appari come "${utente.alias}"`, icon: <MessageCircle size={16} /> },
                    { v: false, l: 'Usa nome reale', desc: `Appari come "${utente.nome} ${utente.cognome}${utente.annoDiNascita ? ` (${utente.annoDiNascita})` : ''}"`, icon: <User size={16} /> },
                  ].map(opt => (
                    <label key={String(opt.v)} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                      border: `1.5px solid ${mostraAlias === opt.v ? 'var(--ms-green)' : '#e5e7eb'}`,
                      borderRadius: 10, cursor: 'pointer',
                      background: mostraAlias === opt.v ? 'var(--ms-green-light)' : '#fff',
                    }}>
                      <input type="radio" name="alias"
                        checked={mostraAlias === opt.v}
                        onChange={() => setMostraAlias(opt.v)}
                        style={{ accentColor: 'var(--ms-green)' }} />
                      <div style={{ color: 'var(--ms-green)', flexShrink: 0 }}>{opt.icon}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{opt.l}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button className="btn-primary" style={{ width: '100%' }}
                disabled={saving}
                onClick={() => salvaImpostazioni({ statoAnnuncio, mostraAliasInChat: mostraAlias, nascondiRuolo, descrizione, notificheEmailChat })}>
                {/* Notifiche email chat */}
              <div>
                <label className="ms-label">Notifiche email per nuovi messaggi</label>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 10px' }}>
                  Ricevi un'email quando qualcuno ti scrive in chat
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { v: true,  l: 'Attive', desc: 'Ricevi email per ogni nuovo messaggio', icon: <Bell size={16} /> },
                    { v: false, l: 'Disattivate', desc: 'Nessuna email — controlla la chat manualmente', icon: <MessageCircle size={16} /> },
                  ].map(opt => (
                    <label key={String(opt.v)} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                      border: `1.5px solid ${notificheEmailChat === opt.v ? 'var(--ms-green)' : '#e5e7eb'}`,
                      borderRadius: 10, cursor: 'pointer',
                      background: notificheEmailChat === opt.v ? 'var(--ms-green-light)' : '#fff',
                    }}>
                      <input type="radio" name="notifiche"
                        checked={notificheEmailChat === opt.v}
                        onChange={() => setNotificheEmailChat(opt.v)}
                        style={{ accentColor: 'var(--ms-green)' }} />
                      <div style={{ color: 'var(--ms-green)', flexShrink: 0 }}>{opt.icon}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{opt.l}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {saved ? <><Check size={16} /> Salvato!</> : saving ? 'Salvataggio...' : 'Salva impostazioni'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Alert */}
      {tab === 'alert' && (
        <div style={{ maxWidth: 560 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: 16, margin: 0 }}>I miei alert</h3>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>
                Ricevi email quando arrivano nuovi annunci con questi criteri
              </p>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
              <Bell size={32} style={{ color: '#d1d5db', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: '#9ca3af', fontSize: 14 }}>Nessun alert impostato.</p>
              <p style={{ color: '#9ca3af', fontSize: 13 }}>Clicca "Imposta alert" dalla pagina degli annunci.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alerts.map(alert => (
                <div key={alert.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                    {alert.sport && <span style={{ fontSize: 11, background: 'var(--ms-green-light)', color: 'var(--ms-green)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                      {SPORT_LABELS[alert.sport as keyof typeof SPORT_LABELS]}
                    </span>}
                    {alert.ruolo && <span style={{ fontSize: 11, background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 20 }}>{alert.ruolo}</span>}
                    {alert.regione && <span style={{ fontSize: 11, background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 20 }}>📍 {alert.regione}</span>}
                    {alert.categoria && <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 20 }}>{alert.categoria}</span>}
                    {!alert.sport && !alert.ruolo && !alert.regione && (
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>Tutti gli annunci</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#9ca3af' }}>
                      {new Date(alert.createdAt).toLocaleDateString('it-IT')}
                    </span>
                    <button
                      onClick={() => eliminaAlert(alert.id)}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
                      title="Elimina alert"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Privacy */}
      {tab === 'privacy' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, maxWidth: 560 }}>
          <h3 style={{ fontWeight: 600, fontSize: 16, margin: '0 0 16px' }}>Privacy e sicurezza</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 14 }}>
              <div style={{ fontWeight: 600, color: '#166534', fontSize: 14, marginBottom: 6 }}>Dati visibili pubblicamente</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#374151', lineHeight: 1.8 }}>
                <li>Alias</li>
                <li>Anno di nascita</li>
                <li>Comune di residenza</li>
                <li>Sport, ruoli e categorie</li>
                <li>Stato (disponibile / cerca squadra)</li>
              </ul>
            </div>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 14 }}>
              <div style={{ fontWeight: 600, color: '#991b1b', fontSize: 14, marginBottom: 6 }}>Dati privati (solo admin)</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#374151', lineHeight: 1.8 }}>
                <li>Nome e cognome</li>
                <li>Data di nascita completa</li>
                <li>Codice fiscale</li>
                <li>Email e numero di telefono</li>
              </ul>
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
              Per esercitare i tuoi diritti (accesso, rettifica, cancellazione) o per richiedere la cancellazione dell'account, contatta:{' '}
              <a href="mailto:info.mondo2026@gmail.com" style={{ color: 'var(--ms-green)', fontWeight: 600 }}>info.mondo2026@gmail.com</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
