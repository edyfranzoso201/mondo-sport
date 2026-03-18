'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageCircle, Lock, MapPin, ChevronLeft, ChevronRight, Bell, Plus, Trophy, Handshake, Users, Calendar } from 'lucide-react'
import type { AnnuncioConProfilo } from '@/types'
import { getTipoColors, TIPO_LABEL } from '@/lib/tipoColors'
import { SPORT_LABELS } from '@/types'
import type { Sport } from '@/types'
import ChatModal from '@/components/chat/ChatModal'
import AlertModal from '@/components/chat/AlertModal'
import { useState } from 'react'

interface Props {
  annunci: AnnuncioConProfilo[]
  total: number
  isGuest: boolean
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
  cerca_amichevole: { label: 'Cerco amichevole', icon: <Handshake size={11} />, bg: '#ede9fb', text: '#5a2a9e' },
}

const LIVELLO_CONFIG: Record<string, { label: string; color: string }> = {
  basso: { label: 'Basso',  color: '#059669' },
  medio: { label: 'Medio',  color: '#d97706' },
  alto:  { label: 'Alto',   color: '#dc2626' },
}

export default function AnnunciListV2({ annunci, total, isGuest, filtriAttivi, page }: Props) {
  const router = useRouter()
  const [chatTarget, setChatTarget] = useState<any>(null)
  const [alertOpen, setAlertOpen] = useState(false)
  const limit = isGuest ? 10 : 20
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, margin: 0 }}>Annunci</h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>
            {isGuest ? `Ultimi 10 — registrati per vedere tutti i ${total}` : `${total} annunci`}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginBottom: 20 }}>
          {annunci.map((ann, i) => <AnnuncioCard key={ann.id} ann={ann} isGuest={isGuest} onChat={() => setChatTarget(ann.autore)} delay={i * 35} />)}
        </div>
      )}

      {isGuest && (
        <div style={{ background: 'linear-gradient(135deg, var(--ms-green) 0%, var(--ms-green-dark) 100%)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: 15 }}>🎉 Registrazione gratuita</p>
            <p style={{ color: 'rgba(255,255,255,0.75)', margin: '4px 0 0', fontSize: 13 }}>Vedi tutti gli annunci e contatta direttamente atleti e società.</p>
          </div>
          <Link href="/registrazione" style={{ background: 'var(--ms-accent)', color: '#1a1200', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap' }}>
            È Gratis! →
          </Link>
        </div>
      )}

      {!isGuest && totalPages > 1 && (
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
  const sport = ann.sport
  const colors = SPORT_COLORS[sport] || SPORT_COLORS.calcio
  const tipoConf = TIPO_CONFIG[ann.tipo] || TIPO_CONFIG.ricerca_squadra
  const isTorneo = ann.tipo === 'torneo' || ann.tipo === 'amichevole'
  const tipoUtente = ann.autore.tipo || 'atleta'
  const tc = getTipoColors(tipoUtente)
  const iniziale = (ann.autore.nomeSocieta || ann.autore.alias || '?')[0].toUpperCase()

  return (
    <div className="ms-card animate-in" style={{ animationDelay: `${delay}ms`, borderColor: tc.border, borderWidth: 1.5 }}>
      <div style={{ height: 3, background: tc.border }} />
      <div style={{ padding: '12px 14px' }}>
        {/* Tipo badge + sport */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.3px', background: tipoConf.bg, color: tipoConf.text }}>
            {tipoConf.icon} {tipoConf.label}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, textTransform: 'uppercase', background: colors.bg, color: colors.text }}>
            {SPORT_LABELS[sport] || sport}
          </span>

          {ann.categoria?.slice(0, 2).map(c => (
            <span key={c} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10, background: '#fef3c7', color: '#92400e' }}>
              {c}
            </span>
          ))}
        </div>

        {/* Titolo */}
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 6px', lineHeight: 1.3, color: '#1e2e34', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
            {ann.descrizione}
          </p>
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

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f0f4f5', paddingTop: 10 }}>
          <span style={{ fontSize: 10, color: '#b0bec5' }}>
            {new Date(ann.bumpedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
          </span>
          {isGuest ? (
            <Link href="/registrazione" title="Registrati per contattare"
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid #d0dde2', borderRadius: 6, background: 'transparent', color: '#b0bec5', fontSize: 12, textDecoration: 'none' }}>
              <Lock size={11} /> Chat
            </Link>
          ) : (ann as any).chiuso ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid #f0c060', borderRadius: 6, background: '#fef3e2', color: '#c07820', fontSize: 11, fontWeight: 600 }}>
              🔒 Non disponibile
            </span>
          ) : (
            <button onClick={onChat}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: `1px solid ${tc.border}`, borderRadius: 6, background: 'transparent', color: tc.text, fontSize: 12, cursor: 'pointer', fontWeight: 600, transition: 'background 0.12s', fontFamily: 'Barlow, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.background = tc.bg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <MessageCircle size={12} /> Chat
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
