'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageCircle, Lock, MapPin, ChevronLeft, ChevronRight, Bell } from 'lucide-react'
import type { ProfiloPubblico, FiltriRicerca } from '@/types'
import { SPORT_LABELS } from '@/types'
import ChatModal from '@/components/chat/ChatModal'
import AlertModal from '@/components/chat/AlertModal'
import { useState } from 'react'

interface AnnunciListProps {
  profili: ProfiloPubblico[]
  total: number
  isGuest: boolean
  filtriAttivi: FiltriRicerca
  page: number
}

const SPORT_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  calcio:    { bg: '#e8f5ee', text: '#1a6b3a', bar: '#1a6b3a' },
  pallavolo: { bg: '#e6f0fb', text: '#1a4fa8', bar: '#1a4fa8' },
  basket:    { bg: '#faeada', text: '#b84a0e', bar: '#b84a0e' },
}

const TIPO_COLORS: Record<string, string> = {
  atleta: '#7c3aed', societa: '#0891b2', staff: '#b45309',
}

export default function AnnunciList({ profili, total, isGuest, filtriAttivi, page }: AnnunciListProps) {
  const router = useRouter()
  const [chatTarget, setChatTarget] = useState<ProfiloPubblico | null>(null)
  const [alertOpen, setAlertOpen] = useState(false)
  const limit = isGuest ? 10 : (filtriAttivi.limit || 20)
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, margin: 0 }}>Annunci</h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>
            {isGuest
              ? `Ultimi 10 annunci — registrati per vedere tutti i ${total}`
              : `${total} annunci trovati`}
          </p>
        </div>
        {/* Alert solo per utenti registrati */}
        {!isGuest && (
          <button className="btn-ghost" onClick={() => setAlertOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bell size={14} /> Imposta alert
          </button>
        )}
      </div>

      {/* Cards Grid */}
      {profili.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#6b7280' }}>Nessun annuncio trovato</p>
          <p style={{ fontSize: 14 }}>Prova a modificare i filtri di ricerca</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
          {profili.map((p, i) => (
            <AnnouncementCard
              key={p.id} profilo={p} isGuest={isGuest}
              onChat={() => setChatTarget(p)}
              animDelay={i * 40}
            />
          ))}
        </div>
      )}

      {/* Guest CTA */}
      {isGuest && (
        <div style={{
          background: 'linear-gradient(135deg, var(--ms-green) 0%, var(--ms-green-dark) 100%)',
          borderRadius: 12, padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, marginBottom: 12,
        }}>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: 15 }}>
              🎉 Registrazione gratuita — Stai vedendo solo 10 annunci
            </p>
            <p style={{ color: 'rgba(255,255,255,0.75)', margin: '4px 0 0', fontSize: 13 }}>
              Registrati gratis per accedere a tutti gli annunci e contattare atleti e società.
            </p>
          </div>
          <Link href="/registrazione" style={{
            background: 'var(--ms-accent)', color: '#1a1200',
            padding: '10px 20px', borderRadius: 8, textDecoration: 'none',
            fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap',
          }}>
            È Gratis! →
          </Link>
        </div>
      )}

      {/* Alert bar — solo registrati */}
      {isGuest && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bell size={16} style={{ color: '#d97706', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#92400e' }}>
            Vuoi ricevere notifiche sui nuovi annunci?{' '}
            <Link href="/registrazione" style={{ color: 'var(--ms-green)', fontWeight: 600 }}>Registrati gratis e imposta un alert</Link>
          </span>
        </div>
      )}

      {/* Pagination */}
      {!isGuest && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24, alignItems: 'center' }}>
          <button className="btn-ghost" onClick={() => goPage(page - 1)} disabled={page === 1}><ChevronLeft size={16} /></button>
          {[...Array(Math.min(totalPages, 7))].map((_, i) => {
            const p = i + 1
            return (
              <button key={p} onClick={() => goPage(p)} style={{
                width: 34, height: 34, borderRadius: 8, border: '1px solid',
                borderColor: p === page ? 'var(--ms-green)' : '#e5e7eb',
                background: p === page ? 'var(--ms-green)' : 'transparent',
                color: p === page ? '#fff' : '#374151',
                fontSize: 14, fontWeight: p === page ? 600 : 400, cursor: 'pointer',
              }}>{p}</button>
            )
          })}
          <button className="btn-ghost" onClick={() => goPage(page + 1)} disabled={page === totalPages}><ChevronRight size={16} /></button>
        </div>
      )}

      {/* Chat Modal */}
      {chatTarget && <ChatModal destinatario={chatTarget} onClose={() => setChatTarget(null)} />}

      {/* Alert Modal */}
      {alertOpen && !isGuest && <AlertModal filtriAttivi={filtriAttivi} onClose={() => setAlertOpen(false)} />}
    </div>
  )
}

function AnnouncementCard({ profilo, isGuest, onChat, animDelay }: {
  profilo: ProfiloPubblico; isGuest: boolean; onChat: () => void; animDelay: number
}) {
  const sport = profilo.sportPrimario
  const colors = SPORT_COLORS[sport] || SPORT_COLORS.calcio
  const tipoColor = TIPO_COLORS[profilo.tipo] || '#6b7280'
  const nome = profilo.nomeSocieta || profilo.alias
  const initials = nome.split(/[_\s]/).slice(0, 2).map((w: string) => w[0]?.toUpperCase() || '').join('')

  return (
    <div className="ms-card animate-in" style={{ animationDelay: `${animDelay}ms` }}>
      <div style={{ height: 3, background: colors.bar }} />
      <div style={{ padding: '12px 14px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div className="ms-avatar" style={{
            background: colors.bg, color: colors.text,
            borderRadius: profilo.tipo === 'societa' ? 8 : '50%',
          }}>
            {initials || '?'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {nome}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={10} />
              {profilo.comune}
              {profilo.annoDiNascita > 1900 && ` · ${profilo.annoDiNascita}`}
            </div>
          </div>
        </div>

        {/* Descrizione breve */}
        {profilo.descrizione && (
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
            {profilo.descrizione}
          </p>
        )}

        {/* Tags sport */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          <span className={`chip chip-${sport}`}>{SPORT_LABELS[sport] || sport}</span>
          {/* Ruoli: nascosti se nastoscoRuolo, visibili altrimenti */}
          {!profilo.nascondiRuolo && profilo.ruoli.slice(0, 2).map(r => (
            <span key={r} className="chip chip-role">{r}</span>
          ))}
          {profilo.categoria[0] && <span className="chip chip-cat">{profilo.categoria[0]}</span>}
        </div>

        {/* Tipo badge */}
        <div style={{ marginBottom: 10 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
            color: tipoColor, background: tipoColor + '18', padding: '2px 7px', borderRadius: 10,
          }}>
            {profilo.tipo === 'atleta' ? 'Atleta' : profilo.tipo === 'societa' ? 'Società' : 'Staff'}
          </span>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
          <span className={`chip chip-${profilo.statoAnnuncio === 'disponibile' ? 'disponibile' : 'cerca'}`} style={{ fontSize: 10 }}>
            {profilo.statoAnnuncio === 'disponibile' ? '● Disponibile' : '● Cerca squadra'}
          </span>

          {/* Chat: bloccata per guest */}
          {isGuest ? (
            <Link href="/registrazione" title="Registrati per contattare"
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: 'transparent', color: '#9ca3af', fontSize: 12, textDecoration: 'none', cursor: 'pointer' }}>
              <Lock size={11} /> Chat
            </Link>
          ) : (
            <button onClick={onChat}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid var(--ms-green)', borderRadius: 6, background: 'transparent', color: 'var(--ms-green)', fontSize: 12, cursor: 'pointer', fontWeight: 600, transition: 'background 0.12s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--ms-green-light)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <MessageCircle size={12} /> Chat
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
