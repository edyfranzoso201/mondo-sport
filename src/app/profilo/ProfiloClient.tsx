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
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 0 40px' }}>

      {/* Header profilo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 0 16px', borderBottom: '1px solid #e8f0f4', marginBottom: 0 }}>
        <div style={{ width: 52, height: 52, borderRadius: utente.tipo === 'societa' ? 10 : '50%', background: 'var(--ms-green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, flexShrink: 0 }}>
          {utente.alias?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, margin: 0, color: '#1e3a8a' }}>
            {utente.alias}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#d1fae5', color: '#065f46', fontWeight: 700, textTransform: 'uppercase' }}>
              {utente.tipo === 'atleta' ? 'Atleta' : utente.tipo === 'societa' ? 'Società' : 'Staff'}
            </span>
            <span style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={11} /> {utente.comune}, {utente.regione}
            </span>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e8f0f4', marginBottom: 20, overflowX: 'auto' }}>
        {[
          { id: 'profilo', label: 'Profilo', icon: <User size={14} /> },
          { id: 'visibilita', label: 'Visibilità', icon: <Eye size={14} /> },
          { id: 'alert', label: `Alert ${alerts.length}`, icon: <Bell size={14} /> },
          { id: 'privacy', label: 'Privacy', icon: <Shield size={14} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px',
              background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t.id ? 'var(--ms-green)' : 'transparent'}`,
              color: tab === t.id ? 'var(--ms-green)' : '#6b7280',
              fontWeight: tab === t.id ? 600 : 400, fontSize: 13, cursor: 'pointer',
              fontFamily: 'Barlow, sans-serif', marginBottom: -1, whiteSpace: 'nowrap',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* TAB PROFILO */}
      {tab === 'profilo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Dati pubblici */}
          <div className="ms-card" style={{ padding: '16px 18px' }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, margin: '0 0 12px', color: '#1e3a8a' }}>
              Dati pubblici
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { l: 'Alias', v: utente.alias },
                { l: 'Anno di nascita', v: utente.annoDiNascita },
                { l: 'Comune', v: utente.comune },
                { l: 'Regione', v: utente.regione },
                { l: 'Sport', v: utente.sport?.map((s: string) => SPORT_LABELS[s as keyof typeof SPORT_LABELS] || s).join(', ') },
                { l: 'Ruoli', v: utente.ruoli?.join(', ') },
                { l: 'Categorie', v: utente.categoria?.join(', ') },
              ].map(({ l, v }) => (
                <div key={l} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                  <span style={{ color: '#6b7280', minWidth: 130, flexShrink: 0 }}>{l}</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{String(v || '—')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dati privati */}
          <div className="ms-card" style={{ padding: '16px 18px' }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: '#1e3a8a' }}>
              Dati privati
            </h3>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 12px' }}>Visibili solo all'amministratore</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { l: 'Nome completo', v: `${utente.nome} ${utente.cognome}` },
                { l: 'Data di nascita', v: utente.dataNascita },
                { l: 'Email', v: utente.email, verified: utente.emailVerificato },
                { l: 'Telefono', v: utente.telefono },
                { l: 'Codice fiscale', v: utente.codiceFiscale },
              ].map(({ l, v, verified }) => (
                <div key={l} style={{ display: 'flex', gap: 8, fontSize: 13, alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', minWidth: 130, flexShrink: 0 }}>{l}</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{String(v || '—')}</span>
                  {verified === true && <Check size={13} color="#059669" />}
                  {verified === false && <span style={{ fontSize: 10, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: 6 }}>Non verificata</span>}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB VISIBILITA */}
      {tab === 'visibilita' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Link curriculum */}
          <Link href="/profilo/curriculum" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f0f9f4', border: '1.5px solid #a7f3d0', borderRadius: 10, textDecoration: 'none', color: '#065f46' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={18} color="#059669" />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>Curriculum Sportivo</p>
                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Esperienze, titoli, qualifiche</p>
              </div>
            </div>
            <ChevronRight size={18} color="#059669" />
          </Link>

          {/* Impostazioni visibilità */}
          <div className="ms-card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, margin: 0, color: '#1e3a8a' }}>
              Impostazioni visibilità
            </h3>

            {/* Stato annuncio */}
            <div>
              <label className="ms-label">Il mio stato</label>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 10px' }}>Controlla se il tuo profilo è visibile agli altri utenti</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { v: 'disponibile', l: 'Disponibile', desc: 'Visibile, sono disponibile per contatti', color: '#059669', bg: '#d1fae5' },
                  { v: 'cerca', l: 'Cerco squadra', desc: 'Visibile, sto cercando attivamente', color: '#2563eb', bg: '#dbeafe' },
                  { v: 'nascosto', l: 'Non visibile', desc: 'Il tuo profilo non compare negli annunci', color: '#6b7280', bg: '#f3f4f6' },
                ].map(opt => (
                  <label
                    key={opt.v}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${statoAnnuncio === opt.v ? opt.color : '#e5e7eb'}`, background: statoAnnuncio === opt.v ? opt.bg : '#fff', cursor: 'pointer' }}
                  >
                    <input
                      type="radio"
                      name="stato"
                      value={opt.v}
                      checked={statoAnnuncio === opt.v}
                      onChange={() => setStatoAnnuncio(opt.v)}
                      style={{ accentColor: opt.color }}
                    />
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: opt.color }}>{opt.l}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Descrizione */}
            <div>
              <label className="ms-label">Descrizione annuncio</label>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 8px' }}>Breve testo visibile sulla tua card (max 140 caratteri)</p>
              <textarea
                className="ms-input"
                rows={3}
                maxLength={140}
                style={{ resize: 'none', fontFamily: 'Barlow, sans-serif', fontSize: 13 }}
                value={descrizione}
                onChange={e => setDescrizione(e.target.value)}
                placeholder="Es. Centrocampista con 10 anni di esperienza..."
              />
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0', textAlign: 'right' }}>{descrizione?.length ?? 0}/140</p>
            </div>

            {/* Nascondi ruolo */}
            <div>
              <label className="ms-label">Visibilità del ruolo</label>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 10px' }}>Scegli se mostrare il tuo ruolo nella card</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { v: false, l: 'Mostra il ruolo', desc: 'Il tuo ruolo è visibile sulla card annuncio' },
                  { v: true, l: 'Nascondi il ruolo', desc: 'Il ruolo non viene mostrato pubblicamente' },
                ].map(opt => (
                  <label
                    key={String(opt.v)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${nascondiRuolo === opt.v ? 'var(--ms-green)' : '#e5e7eb'}`, background: nascondiRuolo === opt.v ? '#f0fdf4' : '#fff', cursor: 'pointer' }}
                  >
                    <input
                      type="radio"
                      name="nascondiRuolo"
                      checked={nascondiRuolo === opt.v}
                      onChange={() => setNascondiRuolo(opt.v)}
                      style={{ accentColor: 'var(--ms-green)' }}
                    />
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{opt.l}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Salva visibilità */}
            <button
              className="btn-primary"
              onClick={() => salvaImpostazioni({ statoAnnuncio, nascondiRuolo, descrizione })}
              disabled={saving}
              style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {saving ? 'Salvo...' : saved ? <><Check size={14} /> Salvato!</> : 'Salva impostazioni'}
            </button>
          </div>
        </div>
      )}

      {/* TAB ALERT */}
      {tab === 'alert' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, margin: 0, color: '#1e3a8a' }}>I tuoi alert</h3>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Ricevi email quando arrivano nuovi annunci con questi criteri</p>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
              <Bell size={32} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <p style={{ margin: 0, fontWeight: 500 }}>Nessun alert impostato.</p>
              <p style={{ margin: '6px 0 0', fontSize: 13 }}>Clicca "Imposta alert" dalla pagina degli annunci.</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className="ms-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {alert.sport && <span><strong>Sport:</strong> {SPORT_LABELS[alert.sport as keyof typeof SPORT_LABELS] || alert.sport}</span>}
                  {alert.regione && <span><strong>Regione:</strong> {alert.regione}</span>}
                  {alert.comune && <span><strong>Comune:</strong> {alert.comune}</span>}

                  {alert.ruolo && <span><strong>Ruolo:</strong> {alert.ruolo}</span>}
                </div>
                <button
                  onClick={() => eliminaAlert(alert.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', flexShrink: 0, padding: 4 }}
                  title="Elimina alert"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB PRIVACY */}
      {tab === 'privacy' && (
        <div className="ms-card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, margin: 0, color: '#1e3a8a' }}>
            Impostazioni privacy
          </h3>

          {/* Alias in chat */}
          <div>
            <label className="ms-label">Nome in chat</label>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 10px' }}>Come appari nelle conversazioni</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { v: true, l: 'Usa il mio alias', desc: `Appari come "${utente.alias}"` },
                { v: false, l: 'Usa il nome completo', desc: `Appari come "${utente.nome} ${utente.cognome}"` },
              ].map(opt => (
                <label
                  key={String(opt.v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${mostraAlias === opt.v ? 'var(--ms-green)' : '#e5e7eb'}`, background: mostraAlias === opt.v ? '#f0fdf4' : '#fff', cursor: 'pointer' }}
                >
                  <input
                    type="radio"
                    name="mostraAlias"
                    checked={mostraAlias === opt.v}
                    onChange={() => setMostraAlias(opt.v)}
                    style={{ accentColor: 'var(--ms-green)' }}
                  />
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{opt.l}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notifiche email chat */}
          <div>
            <label className="ms-label">Notifiche email chat</label>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 10px' }}>Ricevi un'email quando qualcuno ti scrive in chat</p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={notificheEmailChat}
                onChange={e => setNotificheEmailChat(e.target.checked)}
                style={{ accentColor: 'var(--ms-green)', width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {notificheEmailChat ? 'Notifiche attive' : 'Notifiche disattivate'}
              </span>
            </label>
          </div>

          {/* Salva privacy */}
          <button
            className="btn-primary"
            onClick={() => salvaImpostazioni({ mostraAliasInChat: mostraAlias, notificheEmailChat })}
            disabled={saving}
            style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {saving ? 'Salvo...' : saved ? <><Check size={14} /> Salvato!</> : 'Salva impostazioni'}
          </button>
        </div>
      )}

    </div>
  )
}
