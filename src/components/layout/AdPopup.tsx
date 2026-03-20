'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface SlotAd {
  tipo: 'esterno' | 'interno' | 'vuoto'
  titolo?: string
  sottotitolo?: string
  url?: string
  urlImmagine?: string
  colore?: string
  nuovaScheda?: boolean
}

export default function AdPopup() {
  const [visible, setVisible] = useState(false)
  const [slot, setSlot] = useState<SlotAd | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Solo su mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isMobile) return

    const mostraPopup = async () => {
      // Carica uno slot casuale tra left-1 e right-1
      const slotId = Math.random() > 0.5 ? 'left-1' : 'right-1'
      try {
        const res = await fetch('/api/pubblicita')
        const data = await res.json()
        const slots = data.data || []
        const attivi = slots.filter((s: any) => s.tipo !== 'vuoto' && s.attivo)
        if (attivi.length > 0) {
          const s = attivi[Math.floor(Math.random() * attivi.length)]
          setSlot({
            tipo: s.tipo,
            titolo: s.titolo,
            sottotitolo: s.sottotitolo,
            url: s.urlEsterno || (s.paginaInterna ? `/${s.paginaInterna}` : undefined),
            urlImmagine: s.immagineUrl,
            colore: s.coloresfondo,
            nuovaScheda: s.apriNuovaTab,
          })
          setVisible(true)
        }
      } catch {}
    }

    // Prima apparizione dopo 5 secondi
    const firstTimer = setTimeout(mostraPopup, 5000)

    // Poi ogni 30 minuti
    const interval = setInterval(mostraPopup, 30 * 60 * 1000)

    return () => {
      clearTimeout(firstTimer)
      clearInterval(interval)
    }
  }, [isMobile])

  if (!visible || !slot || !isMobile) return null

  const handleClick = () => {
    if (slot.url) {
      if (slot.nuovaScheda) window.open(slot.url, '_blank')
      else window.location.href = slot.url
    }
    setVisible(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, overflow: 'hidden',
        maxWidth: 320, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'slideUp 0.3s ease',
      }}>
        {/* Header con X */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f0f0f0', background: '#f8fbfc' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Annuncio sponsorizzato</span>
          <button onClick={() => setVisible(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Contenuto */}
        <div
          onClick={handleClick}
          style={{
            cursor: slot.url ? 'pointer' : 'default',
            background: slot.colore || 'var(--ms-green)',
            minHeight: 200,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: 24, textAlign: 'center',
          }}>
          {slot.urlImmagine ? (
            <img src={slot.urlImmagine} alt={slot.titolo || 'Annuncio'} style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 8, marginBottom: slot.titolo ? 12 : 0 }} />
          ) : null}
          {slot.titolo && (
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1.2 }}>
              {slot.titolo}
            </div>
          )}
          {slot.sottotitolo && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 6 }}>
              {slot.sottotitolo}
            </div>
          )}
          {slot.url && (
            <div style={{ marginTop: 16, padding: '8px 20px', background: 'rgba(255,255,255,0.2)', borderRadius: 20, fontSize: 12, color: '#fff', fontWeight: 600 }}>
              Scopri di più →
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 14px', textAlign: 'center' }}>
          <button onClick={() => setVisible(false)} style={{ fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Barlow, sans-serif' }}>
            Chiudi e continua a navigare
          </button>
        </div>
      </div>
    </div>
  )
}
