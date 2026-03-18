'use client'
import { useState, useEffect, useRef } from 'react'
import { X, Send, Loader2 } from 'lucide-react'
import type { ProfiloPubblico, Messaggio } from '@/types'

interface ChatModalProps {
  destinatario: ProfiloPubblico
  onClose: () => void
}

export default function ChatModal({ destinatario, onClose }: ChatModalProps) {
  const [convId, setConvId] = useState<string | null>(null)
  const [messaggi, setMessaggi] = useState<Messaggio[]>([])
  const [testo, setTesto] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Avvia o recupera conversazione
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinatarioId: destinatario.id }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setConvId(data.data.id)
          return fetch(`/api/chat/${data.data.id}`)
        }
      })
      .then(r => r?.json())
      .then(data => {
        if (data?.success) setMessaggi(data.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [destinatario.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messaggi])

  const invia = async () => {
    if (!testo.trim() || !convId || sending) return
    setSending(true)
    const res = await fetch(`/api/chat/${convId}`, {
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

  const nome = destinatario.nomeSocieta || destinatario.alias

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
      padding: '16px',
    }} onClick={onClose}>
      <div
        style={{
          width: 340, background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          maxHeight: '70vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'var(--ms-green)', padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ color: '#fff', fontWeight: 600, margin: 0, fontSize: 14 }}>{nome}</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: 11 }}>
              {destinatario.ruoli[0]} · {destinatario.comune}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Messaggi */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
              <Loader2 size={20} className="spinner" style={{ color: 'var(--ms-green)' }} />
            </div>
          ) : messaggi.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '20px 0' }}>
              Inizia la conversazione con {nome}
            </p>
          ) : messaggi.map(m => (
            <ChatBubble key={m.id} messaggio={m} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8 }}>
          <input
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 20,
              border: '1.5px solid #e5e7eb', fontSize: 13,
              fontFamily: 'Barlow, sans-serif', outline: 'none',
            }}
            placeholder="Scrivi un messaggio..."
            value={testo}
            onChange={e => setTesto(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && invia()}
            onFocus={e => (e.target.style.borderColor = 'var(--ms-green)')}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          />
          <button
            onClick={invia}
            disabled={!testo.trim() || sending}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: testo.trim() ? 'var(--ms-green)' : '#e5e7eb',
              border: 'none', cursor: testo.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
          >
            {sending
              ? <Loader2 size={14} className="spinner" style={{ color: '#fff' }} />
              : <Send size={14} style={{ color: '#fff' }} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}

function ChatBubble({ messaggio }: { messaggio: Messaggio }) {
  // Nota: in produzione confrontare con session userId
  const isOwn = false // placeholder
  return (
    <div style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '80%', padding: '7px 11px', borderRadius: isOwn ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
        background: isOwn ? 'var(--ms-green)' : '#f3f4f6',
        color: isOwn ? '#fff' : '#111', fontSize: 13, lineHeight: 1.4,
      }}>
        {messaggio.testo}
        <div style={{ fontSize: 10, color: isOwn ? 'rgba(255,255,255,0.6)' : '#9ca3af', marginTop: 2, textAlign: 'right' }}>
          {new Date(messaggio.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}
