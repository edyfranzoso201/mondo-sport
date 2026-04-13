'use client'
import { useState } from 'react'
import Link from 'next/link'
import { User, Bell, Eye, Check, Trash2, MapPin, Shield, MessageCircle, FileText, ChevronRight } from 'lucide-react'
import { SPORTLABELS } from '@/types'
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
  const [nascondiRuolo, setNascondiRuolo] = useState(utente.nascondiRuolo ?? false)
  const [descrizione, setDescrizione] = useState(utente.descrizione)
  const [notificheEmailChat, setNotificheEmailChat] = useState(utente.notificheEmailChat ?? false)
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

      {/* Header profilo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--ms-green-light)', color: 'var(--ms-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 700
        }}>
          {utente.alias[0].toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 26, fontWeight: 700, margin: 0 }}>
            {utente.alias}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
              background: 'var(--ms-green-light)', color: 'var(--ms-green)', padding: '2px 8px', borderRadius: 10
            }}>
              {utente.tipo === 'atleta' ? 'Atleta' : utente.tipo === 'societa' ? 'Società' : 'Staff'}
            </span>
            <span style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={11} />{utente.comune}, {utente.regione}
            </span>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid #e5e7eb', marginBottom: 24, overflowX: 'auto' }}>
        {[
          { id: 'profilo', label: 'Profilo', icon: <User size={14} /> },
          { id: 'visibilita', label: 'Visibilità', icon: <Eye size={14} /> },
          { id: 'alert', label: `Alert ${alerts.length}`, icon: <Bell size={14} /> },
          { id: 'privacy', label: 'Privacy', icon: <Shield size={14} /> },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 14px', background: 'none', border: 'none',
            borderBottom: `2px solid ${tab === t.id ? 'var(--ms-green)' : 'transparent'}`,
            color: tab === t.id ? 'var(--ms-green)' : '#6b7280',
            fontWeight: tab === t.id ? 600 : 400,
            fontSize: 13, cursor: 'pointer', fontFamily: 'Barlow, sans-serif',
            marginBottom: -1, whiteSpace: 'nowrap',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* TAB PROFILO */}
      {tab === 'profilo' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>

          {/* Dati pubblici */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: 15, margin: '0 0 16px', color: '#111' }}>Dati pubblici</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { l: 'Alias', v: utente.alias },
                { l: 'Anno di nascita', v: utente.annoDiNascita },
                { l: 'Comune', v: utente.comune },
                { l: 'Regione', v: utente.regione },
                { l: 'Sport', v: utente.sport.map((s: string) => SPORTLABELS[s as keyof typeof SPORTLABELS] || s).join(', ') },
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
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 16px' }}>Visibili solo all&apos;amministratore</p>
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

      {/* TAB VISIBILITA */}
      {tab === 'visibilita' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>

          {/* Link curriculum */}
          <Link href="/profilo/curriculum" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, var(--ms-green) 0%, var(--ms-green-dark) 100%)',
            borderRadius: 12, padding: '16px 20px', textDecoration: 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FileText size={20} style={{ color: '#fff' }} />
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Curriculum Sportivo</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Esperienze, titoli, qualifiche</div>
              </div>
            </div>
            <ChevronRight size={20} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </Link>

          {/* Impostazioni visibilità */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontWeight: 600, fontSize: 16, margin: '0 0 20px' }}>Impostazioni visibilità</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

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
                    abel key={opt.v} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                      border: `1.5px solid ${statoAnnuncio === opt.v ? opt.color : '#e5e7eb'}`,
                      borderRadius: 10, cursor: 'pointer',
                      background: statoAnnuncio === opt.v ? opt.bg : '#fff'
                    }}>
                      <input type="radio" name="stato" value={opt.v} checked={statoAnnuncio === opt.v}
                        onChange={() => setStatoAnnuncio(opt.v)} style={{ accentColor: opt.color }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: opt.color }}>{opt.l}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Descrizione */}
              <div>
                abel className="ms-label">Descrizione annuncio</label>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 8px' }}>Breve testo visibile sulla tua card (max 140 caratteri)</p>
                <textarea className="ms-input" rows={3} maxLength={140}
                  style={{ resize: 'none', fontFamily: 'Barlow, sans-serif', fontSize: 13 }}
                  value={descrizione} onChange={e => setDescrizione(e.target.value)}
                  placeholder="Es. Centrocampista con 10 anni di esperienza..." />
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0', textAlign: 'right' }}>{descrizione?.length ?? 0}/140</p>
              </div>

              {/* Nascondi ruolo */}
              <div>
                abel className="ms-label">Visibilità del ruolo</label>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 10px' }}>Scegli se mostrare il tuo ruolo nella card</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {
                            {mediaList.length > 0 && (
          <div style={{ marginBottom: 10, background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6d28d9', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>📁</span> Allegati ({mediaList.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {mediaList.map((m, i) => {
                const id = estraiIdDrive(m.url)
                const embedUrl = id ? `https://drive.google.com/file/d/${id}/preview` : m.url
                const imgUrl = id ? `https://lh3.googleusercontent.com/d/${id}` : m.url
                const icona = m.tipo === 'pdf' ? '📄' : m.tipo === 'immagine' ? '🖼️' : '🎬'
                const label = m.tipo === 'pdf' ? 'PDF' : m.tipo === 'immagine' ? 'Foto' : 'Video'
                const isAperto = mediaAperto === i
                return (
                  <div key={i} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e9d5ff', background: '#fff' }}>
                    <button
                      type="button"
                      onClick={() => setMediaAperto(isAperto ? null : i)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f5f3ff', border: 'none', cursor: 'pointer', fontFamily: 'Barlow, sans-serif' }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#4c1d95', display: 'flex', alignItems: 'center', gap: 5 }}>
                        {icona} {m.titolo || label}
                      </span>
                      <span style={{ fontSize: 10, color: '#7c3aed', fontWeight: 700 }}>{isAperto ? '▲ chiudi' : '▼ anteprima'}</span>
                    </button>
                    {isAperto && (
                      <>
                        {m.tipo === 'immagine' ? (
                          <img
                            src={imgUrl}
                            alt={m.titolo || `Immagine ${i + 1}`}
                            style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }}
                          />
                        ) : (
                          <iframe
                            src={embedUrl}
                            style={{ width: '100%', height: m.tipo === 'pdf' ? 280 : 200, border: 'none', display: 'block' }}
                            allow="autoplay"
                            title={m.titolo || `Media ${i + 1}`}
                          />
                        )}
                        <div style={{ padding: '4px 10px', background: '#f9fafb', display: 'flex', justifyContent: 'flex-end' }}>
                          <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: '#6d28d9', textDecoration: 'none', fontWeight: 600 }}>
                            ↗ Apri in Google Drive
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {((ann as any).linkFacebook || (ann as any).linkInstagram || (ann as any).linkYouTube || (ann as any).linkSito) && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            {(ann as any).linkFacebook && (
              <a href={(ann as any).linkFacebook} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, padding: '3px 8px', borderRadius: 10, background: '#e7f0fd', color: '#1877f2', border: '1px solid #c3d9f8', textDecoration: 'none', fontWeight: 600 }}>
                📘 Facebook
              </a>
            )}
            {(ann as any).linkInstagram && (
              <a href={(ann as any).linkInstagram} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, padding: '3px 8px', borderRadius: 10, background: '#fce4ec', color: '#e1306c', border: '1px solid #f8bbd0', textDecoration: 'none', fontWeight: 600 }}>
                📸 Instagram
              </a>
            )}
            {(ann as any).linkYouTube && (
              <a href={(ann as any).linkYouTube} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, padding: '3px 8px', borderRadius: 10, background: '#fde8e8', color: '#ff0000', border: '1px solid #fcc', textDecoration: 'none', fontWeight: 600 }}>
                ▶️ YouTube
              </a>
            )}
            {(ann as any).linkSito && (
              <a href={(ann as any).linkSito} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, padding: '3px 8px', borderRadius: 10, background: '#e8f3f6', color: '#2a6e78', border: '1px solid #b0d4e0', textDecoration: 'none', fontWeight: 600 }}>
                🌐 Sito web
              </a>
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f0f4f5', paddingTop: 10 }}>
          <span style={{ fontSize: 10, color: '#b0bec5' }}>
            {new Date(ann.bumpedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
          </span>
          {isGuest ? (
            <Link
              href="/registrazione"
              title="Registrati per contattare"
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', border: '1.5px solid #d0dde2', borderRadius: 8, background: hovered ? '#f0f7fa' : 'transparent', color: '#4a7c8e', fontSize: 12, textDecoration: 'none', fontWeight: 600, transition: 'all 0.15s' }}
            >
              <Lock size={11} /> {hovered ? 'Registrati per contattare' : 'Chat'}
            </Link>
          ) : (ann as any).chiuso ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1px solid #f0c060', borderRadius: 8, background: '#fef3e2', color: '#c07820', fontSize: 11, fontWeight: 600 }}>
              🔒 Non disponibile
            </span>
          ) : (
            <button
              onClick={onChat}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', border: `1.5px solid ${bs.border.split(' ')[2] || tc.border}`, borderRadius: 8, background: hovered ? (bs.topBar.includes('gradient') ? bs.topBar : tc.bg) : 'transparent', color: hovered ? '#fff' : tc.text, fontSize: 12, cursor: 'pointer', fontWeight: 700, transition: 'all 0.15s', fontFamily: 'Barlow, sans-serif' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = bs.topBar.includes('gradient') ? bs.topBar : tc.bg
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = tc.text
              }}
            >
              <MessageCircle size={13} /> {hovered ? 'Contatta ora' : 'Chat'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}