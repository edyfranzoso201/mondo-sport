'use client'
import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Loader2, ArrowLeft } from 'lucide-react'
import type { Conversazione, Messaggio, ProfiloPubblico } from '@/types'
import { getTipoColors } from '@/lib/tipoColors'

interface ChatPageProps {
  userId: string
  userAlias: string
  conversazioni: Array<{ conv: Conversazione; profilo: ProfiloPubblico | null; nonLetti: number }>
}

export default function ChatPage({ userId, userAlias, conversazioni: initialConvs }: ChatPageProps) {
  const [convs] = useState(initialConvs)
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [messaggi, setMessaggi] = useState<Messaggio[]>([])
  const [testo, setTesto] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    if (!selectedConvId) return
    setLoading(true)
    fetch(`/api/chat/${selectedConvId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setMessaggi(d.data) })
      .finally(() => setLoading(false))
  }, [selectedConvId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messaggi])

  const invia = async () => {
    if (!testo.trim() || !selectedConvId || sending) return
    setSending(true)
    const res = await fetch(`/api/chat/${selectedConvId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testo }),
    })
    const data = await res.json()
    if (data.success) {
      setMessaggi(prev => [...prev, data.data])
      setTesto('')
    }
    setSending(false)
  }

  const selectedConv = convs.find(c => c.conv.id === selectedConvId)
  const nomeInterlocutore = (p: ProfiloPubblico | null) =>
    p?.nomeSocieta || p?.alias || 'Utente'

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px' }}>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <MessageCircle size={22} style={{ color: 'var(--ms-green)' }} />
        Le mie chat
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedConvId && !isMobile ? '280px 1fr' : selectedConvId ? '1fr' : '280px 1fr',
        gap: 12, height: 'calc(100vh - 180px)', minHeight: 400,
      }}>

        {/* Sidebar conversazioni */}
        {(!selectedConvId || !isMobile) && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontWeight: 600, fontSize: 14, color: '#374151' }}>
              Conversazioni ({convs.length})
            </div>
            {convs.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                <MessageCircle size={32} style={{ color: '#d1d5db' }} />
                <p style={{ margin: 0 }}>Nessuna conversazione ancora.</p>
                <p style={{ margin: 0, fontSize: 12 }}>Contatta un atleta o una società dagli annunci.</p>
              </div>
            ) : (
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {convs.map(({ conv, profilo, nonLetti }) => {
                  const nome = nomeInterlocutore(profilo)
                  const iniziale = nome[0]?.toUpperCase() || '?'
                  const isSelected = selectedConvId === conv.id
                  return (
                    <button key={conv.id} onClick={() => setSelectedConvId(conv.id)}
                      style={{
                        width: '100%', padding: '12px 16px',
                        background: isSelected ? 'var(--ms-green-light)' : 'transparent',
                        border: 'none', borderBottom: '1px solid #f3f4f6',
                        borderLeft: `3px solid ${isSelected ? 'var(--ms-green)' : 'transparent'}`,
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'Barlow, sans-serif',
                        transition: 'background 0.1s',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: isSelected ? 'var(--ms-green)' : 'var(--ms-green-light)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700,
                          color: isSelected ? '#fff' : 'var(--ms-green)', flexShrink: 0,
                        }}>
                          {iniziale}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isSelected ? 'var(--ms-green)' : '#111' }}>
                            {nome}
                          </div>
                          <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {conv.ultimoMessaggio || 'Nessun messaggio'}
                          </div>
                        </div>
                        {nonLetti > 0 && (
                          <span style={{
                            background: 'var(--ms-green)', color: '#fff',
                            borderRadius: '50%', width: 20, height: 20,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, flexShrink: 0,
                          }}>
                            {nonLetti}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Area messaggi */}
        {selectedConvId ? (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header chat */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10, background: '#fafafa' }}>
              {isMobile && (
                <button onClick={() => setSelectedConvId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4 }}>
                  <ArrowLeft size={18} />
                </button>
              )}
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'var(--ms-green)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 14,
              }}>
                {nomeInterlocutore(selectedConv?.profilo || null)[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  {nomeInterlocutore(selectedConv?.profilo || null)}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>
                  {selectedConv?.profilo?.ruoli?.[0]
                    ? `${selectedConv.profilo.ruoli[0]} · ${selectedConv.profilo.comune}`
                    : selectedConv?.profilo?.comune || ''}
                </div>
              </div>
            </div>

            {/* Messaggi */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, background: '#f9fafb' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <Loader2 size={22} className="spinner" style={{ color: 'var(--ms-green)' }} />
                </div>
              ) : messaggi.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, paddingTop: 40 }}>
                  <MessageCircle size={28} style={{ color: '#d1d5db', margin: '0 auto 8px', display: 'block' }} />
                  Inizia la conversazione con {nomeInterlocutore(selectedConv?.profilo || null)}!
                </div>
              ) : messaggi.map(m => {
                const isOwn = m.mittente === userId
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
                    {/* Avatar interlocutore */}
                    {!isOwn && (
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--ms-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--ms-green)', flexShrink: 0 }}>
                        {nomeInterlocutore(selectedConv?.profilo || null)[0]?.toUpperCase()}
                      </div>
                    )}
                    <div style={{
                      maxWidth: '68%', padding: '8px 12px',
                      borderRadius: isOwn ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: isOwn ? 'var(--ms-green)' : '#fff',
                      color: isOwn ? '#fff' : '#111',
                      fontSize: 14, lineHeight: 1.5,
                      border: isOwn ? 'none' : '1px solid #e5e7eb',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}>
                      {/* Nome mittente sopra il messaggio */}
                      {!isOwn && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ms-green)', marginBottom: 2 }}>
                          {nomeInterlocutore(selectedConv?.profilo || null)}
                        </div>
                      )}
                      {m.testo}
                      <div style={{ fontSize: 10, color: isOwn ? 'rgba(255,255,255,0.6)' : '#9ca3af', marginTop: 3, textAlign: 'right' }}>
                        {new Date(m.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {/* Avatar utente corrente */}
                    {isOwn && (
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--ms-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {userAlias[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8, background: '#fff' }}>
              <input
                style={{ flex: 1, padding: '10px 14px', borderRadius: 24, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'Barlow, sans-serif', outline: 'none', transition: 'border-color 0.15s' }}
                placeholder="Scrivi un messaggio..."
                value={testo}
                onChange={e => setTesto(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && invia()}
                onFocus={e => (e.target.style.borderColor = 'var(--ms-green)')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
              />
              <button onClick={invia} disabled={!testo.trim() || sending}
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: testo.trim() ? 'var(--ms-green)' : '#e5e7eb',
                  border: 'none', cursor: testo.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}>
                {sending
                  ? <Loader2 size={16} className="spinner" style={{ color: '#fff' }} />
                  : <Send size={16} style={{ color: testo.trim() ? '#fff' : '#9ca3af' }} />}
              </button>
            </div>
          </div>
        ) : !isMobile && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#9ca3af' }}>
            <MessageCircle size={40} style={{ color: '#d1d5db' }} />
            <p style={{ fontSize: 14, margin: 0 }}>Seleziona una conversazione</p>
          </div>
        )}
      </div>
    </div>
  )
}
