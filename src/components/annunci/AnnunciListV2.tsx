'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageCircle, Lock, MapPin, ChevronLeft, ChevronRight, Bell, Plus, Trophy, Handshake, Users, Calendar } from 'lucide-react'
import type { AnnuncioConProfilo } from '@/types'
import { getTipoColors, TIPO_LABEL } from '@/lib/tipoColors'
import { SPORT_LABELS, SPORT_ICONS } from '@/types'
import type { Sport } from '@/types'
import ChatModal from '@/components/chat/ChatModal'
import AlertModal from '@/components/chat/AlertModal'


interface Props {
  annunci: AnnuncioConProfilo[]
  total: number
  isGuest: boolean
  isAdmin?: boolean
  filtriAttivi: Record<string, any>
  page: number
}

const SPORT_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  calcio:    { bg: '#e3f0eb', text: '#3d7a5a', bar: '#3d7a5a' },
  calcio5:   { bg: '#e8f5ee', text: '#2d6a4f', bar: '#2d6a4f' },
  pallavolo: { bg: '#e8f3f6', text: '#4a7c8e', bar: '#4a7c8e' },
  basket:    { bg: '#faeada', text: '#b84a0e', bar: '#b84a0e' },
  padel:     { bg: '#f0eafb', text: '#6d3d8c', bar: '#6d3d8c' },
}

const TIPO_CONFIG: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  ricerca_squadra:  { label: 'Cerca squadra',    icon: <Users size={11} />,     bg: '#ddeaf0', text: '#2a5a78' },
  disponibilita:    { label: 'Disponibile',      icon: <Plus size={11} />,      bg: '#d8eff0', text: '#2a6e78' },
  cerca_atleti:     { label: 'Cerco atleti',     icon: <Users size={11} />,     bg: '#fef3e2', text: '#8a5200' },
  torneo:           { label: 'Torneo',           icon: <Trophy size={11} />,    bg: '#fef3e2', text: '#8a5a00' },
  amichevole:       { label: 'Amichevole',       icon: <Handshake size={11} />, bg: '#f0eafb', text: '#6d3d8c' },
  cerca_torneo:     { label: 'Cerco torneo',     icon: <Trophy size={11} />,    bg: '#fff3cd', text: '#7a5000' },
  cerca_amichevole:   { label: 'Cerco amichevole',       icon: <Handshake size={11} />, bg: '#ede9fb', text: '#5a2a9e' },
  cerca_sponsor:      { label: 'Cerca Sponsor',          icon: <span>🤝</span>,         bg: '#fff7ed', text: '#9a3412' },
  offre_sponsorizzazione: { label: 'Offre Sponsorizzazione', icon: <span>💼</span>,     bg: '#fef9c3', text: '#854d0e' },
}

const LIVELLO_CONFIG: Record<string, { label: string; color: string }> = {
  basso: { label: 'Basso',  color: '#059669' },
  medio: { label: 'Medio',  color: '#d97706' },
  alto:  { label: 'Alto',   color: '#dc2626' },
}

export default function AnnunciListV2({ annunci, total, isGuest, isAdmin, filtriAttivi, page }: Props) {
  const router = useRouter()
  const [chatTarget, setChatTarget] = useState<any>(null)
  const [alertOpen, setAlertOpen] = useState(false)
  const [nuoviAnnunci, setNuoviAnnunci] = useState<AnnuncioConProfilo[]>([])
  const [annunciList, setAnnunciList] = useState(annunci)

  // Carica ultimi annunci (slider top)
  React.useEffect(() => {
    fetch('/api/annunci-v2/ultimi')
      .then(r => r.json())
      .then(d => setNuoviAnnunci(d.annunci || []))
      .catch(() => {})
  }, [])

  const eliminaAnnuncioAdmin = async (annId: string, titolo: string) => {
    if (!confirm(`Eliminare l'annuncio "${titolo}"?`)) return
    if (!confirm('Conferma definitiva: questa operazione è IRREVERSIBILE.')) return
    const res = await fetch('/api/admin/annunci', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ annId }),
    })
    if (res.ok) {
      setAnnunciList(prev => prev.filter(a => a.id !== annId))
      setNuoviAnnunci(prev => prev.filter(a => a.id !== annId))
    }
  }
  const limit = 20
  const totalPages = Math.ceil(total / limit)

  const goPage = (p: number) => {
    const params = new URLSearchParams()
    Object.entries(filtriAttivi).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && k !== 'limit') params.set(k, String(v))
    })
    params.set('page', String(p))
    router.push(`/?${params.toString()}`)
  }

  return (
    <div>
      {/* Frase emozionale */}
      <div style={{ textAlign: 'center', marginBottom: 16, padding: '12px 16px', background: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)', borderRadius: 12, border: '1.5px solid #fecaca' }}>
        <p style={{ fontSize: 18, fontWeight: 800, color: '#dc2626', fontStyle: 'italic', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1.4, margin: 0, whiteSpace: 'normal', wordWrap: 'break-word', maxWidth: '100%' }}>
          Il tuo prossimo traguardo inizia qui. Trova la squadra o il talento che cercavi !!!!!!
        </p>
      </div>

      {/* Legenda colori */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, padding: '7px 12px', background: '#f8fbfc', borderRadius: 10, border: '1px solid #e8f0f4' }}>
        {[
          { color: '#16a34a', label: 'Atleta cerca squadra' },
          { color: '#2563eb', label: 'Società cerca atleti' },
          { color: '#d97706', label: 'Coach / Staff' },
          { color: '#7c3aed', label: 'Torneo' },
          { color: '#ea580c', label: 'Amichevole' },
          { color: '#d97706', label: '🤝 Cerca Sponsor' },
          { color: '#ca8a04', label: '💼 Offre Sponsorizzazione' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, margin: 0 }}>Annunci</h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>
            {`${total} annunci`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isGuest && (
            <>
              <Link href="/annunci/nuovo" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '7px 14px' }}>
                <Plus size={15} /> Nuovo annuncio
              </Link>
              <button className="btn-ghost" onClick={() => setAlertOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                <Bell size={14} /> Alert
              </button>
            </>
          )}
        </div>
      </div>

      {annunci.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#6b7280', margin: '0 0 8px' }}>Nessun annuncio trovato</p>
          <p style={{ fontSize: 14, margin: 0 }}>Modifica i filtri o{!isGuest && <><span> </span><Link href="/annunci/nuovo" style={{ color: 'var(--ms-green)', fontWeight: 600, textDecoration: 'none' }}>crea il primo annuncio</Link></>}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
          {[...annunci]
            .sort((a, b) => {
              if (a.chiuso && !b.chiuso) return 1
              if (!a.chiuso && b.chiuso) return -1
              return 0
            })
            .map((ann, i) => (
              <div key={ann.id} style={{ position: 'relative' }}>
                {isAdmin && (
                  <button
                    onClick={() => eliminaAnnuncioAdmin(ann.id, ann.titolo)}
                    title="Elimina annuncio"
                    style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, padding: '3px 8px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontWeight: 700, fontFamily: 'Barlow, sans-serif' }}>
                    🗑 Elimina
                  </button>
                )}
                <AnnuncioCard ann={ann} isGuest={isGuest} onChat={() => setChatTarget(ann.autore)} delay={i * 35} />
              </div>
            ))}
        </div>
      )}



      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24, alignItems: 'center' }}>
          <button className="btn-ghost" onClick={() => goPage(page - 1)} disabled={page === 1}><ChevronLeft size={16} /></button>
          {[...Array(Math.min(totalPages, 7))].map((_, i) => {
            const p = i + 1
            return <button key={p} onClick={() => goPage(p)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid', borderColor: p === page ? 'var(--ms-green)' : '#d0dde2', background: p === page ? 'var(--ms-green)' : 'transparent', color: p === page ? '#fff' : '#374151', fontSize: 14, fontWeight: p === page ? 600 : 400, cursor: 'pointer' }}>{p}</button>
          })}
          <button className="btn-ghost" onClick={() => goPage(page + 1)} disabled={page === totalPages}><ChevronRight size={16} /></button>
        </div>
      )}

      {chatTarget && <ChatModal destinatario={chatTarget} onClose={() => setChatTarget(null)} />}
      {alertOpen && !isGuest && <AlertModal filtriAttivi={filtriAttivi} onClose={() => setAlertOpen(false)} />}
    </div>
  )
}

function AnnuncioCard({ ann, isGuest, onChat, delay }: { ann: AnnuncioConProfilo; isGuest: boolean; onChat: () => void; delay: number }) {
  const [hovered, setHovered] = React.useState(false)
  const sport = ann.sport
  const colors = SPORT_COLORS[sport] || SPORT_COLORS.calcio
  const tipoConf = TIPO_CONFIG[ann.tipo] || TIPO_CONFIG.ricerca_squadra
  const isTorneo = ann.tipo === 'torneo' || ann.tipo === 'amichevole'
  const tipoUtente = ann.autore.tipo || 'atleta'
  const tc = getTipoColors(tipoUtente)
  const iniziale = (ann.autore.nomeSocieta || ann.autore.alias || '?')[0].toUpperCase()

  // ── Colori bordo per ruolo/tipo ───────────────────────────────────────────
  const getBorderStyle = () => {
    // Bordo Blu: Società che cerca atleti
    if (ann.tipo === 'cerca_atleti') return { border: '2px solid #2563eb', topBar: 'linear-gradient(90deg, #2563eb, #60a5fa)', glow: '0 0 0 1px #bfdbfe' }
    // Bordo Verde: Atleta che cerca squadra
    if (ann.tipo === 'ricerca_squadra' || ann.tipo === 'disponibilita') return { border: '2px solid #16a34a', topBar: 'linear-gradient(90deg, #16a34a, #4ade80)', glow: '0 0 0 1px #bbf7d0' }
    // Bordo Oro: Coach/Preparatore (staff)
    if (tipoUtente === 'staff') return { border: '2px solid #d97706', topBar: 'linear-gradient(90deg, #d97706, #fbbf24)', glow: '0 0 0 1px #fde68a' }
    // Bordo Viola: Torneo
    if (ann.tipo === 'torneo') return { border: '2px solid #7c3aed', topBar: 'linear-gradient(90deg, #7c3aed, #a78bfa)', glow: '0 0 0 1px #ddd6fe' }
    // Bordo Arancio: Amichevole
    if (ann.tipo === 'amichevole' || ann.tipo === 'cerca_amichevole' || ann.tipo === 'cerca_torneo') return { border: '2px solid #ea580c', topBar: 'linear-gradient(90deg, #ea580c, #fb923c)', glow: '0 0 0 1px #fed7aa' }
    // Bordo Oro/Ambra: Sponsor
    if (ann.tipo === 'cerca_sponsor') return { border: '2px solid #d97706', topBar: 'linear-gradient(90deg, #d97706, #fbbf24)', glow: '0 0 0 1px #fde68a' }
    if (ann.tipo === 'offre_sponsorizzazione') return { border: '2px solid #ca8a04', topBar: 'linear-gradient(90deg, #ca8a04, #facc15)', glow: '0 0 0 1px #fef08a' }
    // Default
    return { border: `2px solid ${tc.border}`, topBar: tc.border, glow: 'none' }
  }

  const bs = getBorderStyle()

  return (
    <div
      className="ms-card animate-in"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${delay}ms`,
        border: bs.border,
        borderWidth: 2,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? `0 8px 24px rgba(0,0,0,0.12), ${bs.glow}` : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
      }}>
      {/* Barra colorata in cima */}
      <div style={{ height: 4, background: bs.topBar, borderRadius: '10px 10px 0 0' }} />
      <div style={{ padding: '12px 14px' }}>
        {/* Tipo badge + sport */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.3px', background: tipoConf.bg, color: tipoConf.text }}>
            {tipoConf.icon} {tipoConf.label}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, textTransform: 'uppercase', background: colors.bg, color: colors.text }}>
            {SPORT_ICONS[sport as keyof typeof SPORT_ICONS]}
            {SPORT_LABELS[sport] || sport}
          </span>

          {ann.categoria?.slice(0, 2).map(c => (
            <span key={c} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10, background: '#fef3c7', color: '#92400e' }}>
              {c}
            </span>
          ))}
        </div>

        {/* Titolo */}
        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 6px', lineHeight: 1.3, color: '#1e3a8a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.2px' }}>
          {ann.titolo}
        </h3>

        {/* Autore con avatar colorato per tipo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
          <div style={{
            width: 26, height: 26, borderRadius: tipoUtente === 'societa' ? '6px' : '50%',
            background: tc.avatar, color: tc.avatarText,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, flexShrink: 0,
            border: `2px solid ${tc.border}`,
          }}>
            {iniziale}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
            <span style={{ fontWeight: 700, color: tc.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ann.autore.nomeSocieta || ann.autore.alias}
            </span>
            <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 8, background: tc.badge, color: tc.badgeText, fontWeight: 700, textTransform: 'uppercase', flexShrink: 0 }}>
              {TIPO_LABEL[tipoUtente] || tipoUtente}
            </span>
            <span style={{ color: '#d0dde2' }}>·</span>
            <MapPin size={10} style={{ flexShrink: 0 }} /> 
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ann.comune}</span>
          </div>
        </div>

        {/* Descrizione */}
        {ann.descrizione && (
          <p style={{ fontSize: 12, fontWeight: 700, color: '#1e3a8a', margin: '0 0 8px', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
            {ann.descrizione}
          </p>
        )}

        {/* Info sponsor */}
        {(ann.tipo === 'cerca_sponsor' || ann.tipo === 'offre_sponsorizzazione') && (
          <div style={{ background: '#fffbeb', borderRadius: 8, padding: '8px 10px', marginBottom: 8, fontSize: 11, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {(ann as any).settore && (
              <span style={{ padding: '2px 8px', borderRadius: 10, background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>
                🏢 {(ann as any).settore}
              </span>
            )}
            {(ann as any).budget && (
              <span style={{ padding: '2px 8px', borderRadius: 10, background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>
                💰 {({'sotto_500':'< €500','500_2000':'€500-2k','2000_5000':'€2k-5k','5000_10000':'€5k-10k','oltre_10000':'> €10k'} as any)[(ann as any).budget] || (ann as any).budget}
              </span>
            )}
            {((ann as any).benefici || []).slice(0, 3).map((b: string) => (
              <span key={b} style={{ padding: '2px 8px', borderRadius: 10, background: '#fef9c3', color: '#854d0e', fontWeight: 600 }}>
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Ruoli */}
        {ann.ruoli.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {ann.ruoli.slice(0, 3).map(r => (
              <span key={r} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: '#f0f4f5', color: '#4a6470', border: '1px solid #d8e4e8' }}>{r}</span>
            ))}
            {ann.ruoli.length > 3 && <span style={{ fontSize: 10, color: '#9ca3af' }}>+{ann.ruoli.length - 3}</span>}
          </div>
        )}

        {/* Info chiave: Piede e Altezza */}
        {((ann as any).piede || (ann as any).altezza) && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            {(ann as any).piede && (
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#e8f3f6', color: '#2a6e78', border: '1px solid #b0d4e0', fontWeight: 600 }}>
                🦶 {(ann as any).piede.charAt(0).toUpperCase() + (ann as any).piede.slice(1)}
              </span>
            )}
            {(ann as any).altezza && (
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#e8f3f6', color: '#2a6e78', border: '1px solid #b0d4e0', fontWeight: 600 }}>
                📏 {(ann as any).altezza} cm
              </span>
            )}
          </div>
        )}

        {/* Info torneo */}
        {isTorneo && (
          <div style={{ background: '#f8fbfc', borderRadius: 8, padding: '8px 10px', marginBottom: 8, fontSize: 12, color: '#4a7c8e', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {ann.nSquadreRicercate && (
              <span><Users size={11} style={{ display: 'inline', marginRight: 4 }} />Squadre cercate: <strong>{ann.nSquadreRicercate}</strong></span>
            )}
            {ann.dataInizio && (
              <span><Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />{ann.dataInizio}{ann.dataFine && ann.dataFine !== ann.dataInizio ? ` → ${ann.dataFine}` : ''}</span>
            )}
            {ann.luogo && <span><MapPin size={11} style={{ display: 'inline', marginRight: 4 }} />{ann.luogo}</span>}
          </div>
        )}

        {/* Link Social */}
        {((ann as any).linkFacebook || (ann as any).linkInstagram || (ann as any).linkYouTube || (ann as any).linkSito) && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            {(ann as any).linkFacebook && (
              <a href={(ann as any).linkFacebook} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, padding: '3px 8px', borderRadius: 10, background: '#e7f0fd', color: '#1877f2', border: '1px solid #c3d9f8', textDecoration: 'none', fontWeight: 600 }}>
                📘 Facebook
              </a>
            )}
            {(ann as any).linkInstagram && (
              <a href={(ann as any).linkInstagram} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, padding: '3px 8px', borderRadius: 10, background: '#fce4ec', color: '#e1306c', border: '1px solid #f8bbd0', textDecoration: 'none', fontWeight: 600 }}>
                📸 Instagram
              </a>
            )}
            {(ann as any).linkYouTube && (
              <a href={(ann as any).linkYouTube} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, padding: '3px 8px', borderRadius: 10, background: '#fde8e8', color: '#ff0000', border: '1px solid #fcc', textDecoration: 'none', fontWeight: 600 }}>
                ▶️ YouTube
              </a>
            )}
            {(ann as any).linkSito && (
              <a href={(ann as any).linkSito} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, padding: '3px 8px', borderRadius: 10, background: '#e8f3f6', color: '#2a6e78', border: '1px solid #b0d4e0', textDecoration: 'none', fontWeight: 600 }}>
                🌐 Sito web
              </a>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f0f4f5', paddingTop: 10 }}>
          <span style={{ fontSize: 10, color: '#b0bec5' }}>
            {new Date(ann.bumpedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
          </span>
          {isGuest ? (
            <Link href="/registrazione" title="Registrati per contattare"
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', border: '1.5px solid #d0dde2', borderRadius: 8, background: hovered ? '#f0f7fa' : 'transparent', color: '#4a7c8e', fontSize: 12, textDecoration: 'none', fontWeight: 600, transition: 'all 0.15s' }}>
              <Lock size={11} /> {hovered ? '🔐 Registrati per contattare' : 'Chat'}
            </Link>
          ) : (ann as any).chiuso ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1px solid #f0c060', borderRadius: 8, background: '#fef3e2', color: '#c07820', fontSize: 11, fontWeight: 600 }}>
              🔒 Non disponibile
            </span>
          ) : (
            <button onClick={onChat}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', border: `1.5px solid ${bs.border.split(' ')[2] || tc.border}`, borderRadius: 8, background: hovered ? (bs.topBar.includes('gradient') ? bs.topBar : tc.bg) : 'transparent', color: hovered ? '#fff' : tc.text, fontSize: 12, cursor: 'pointer', fontWeight: 700, transition: 'all 0.15s', fontFamily: 'Barlow, sans-serif' }}
              onMouseEnter={e => { e.currentTarget.style.background = bs.topBar.includes('gradient') ? bs.topBar : tc.bg; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tc.text }}>
              <MessageCircle size={13} /> {hovered ? '✉️ Contatta ora' : 'Chat'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
