'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { SlotAd } from '@/types'
import { getEmbedUrl } from '@/lib/videoUtils'

interface SidebarAdProps {
  position: 'left' | 'right'
}

export default function SidebarAd({ position }: SidebarAdProps) {
  const [slots, setSlots] = useState<SlotAd[]>([])

  useEffect(() => {
    fetch('/api/pubblicita')
      .then(r => r.json())
      .then(d => { if (d.success) setSlots(d.data) })
      .catch(() => {})
  }, [])

  const slotIds = position === 'left'
    ? ['left-1', 'left-2']
    : ['right-1', 'right-2']

  const heights = [320, 240]

  return (
    <aside
      className="ms-sidebar-ad"
      style={{
        background: 'rgba(255,255,255,0.45)',
        borderLeft: position === 'right' ? '1px solid rgba(74,124,142,0.1)' : 'none',
        borderRight: position === 'left' ? '1px solid rgba(74,124,142,0.1)' : 'none',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '20px 8px', gap: 16,
      }}
    >
      {slotIds.map((id, idx) => {
        const slot = slots.find(s => s.id === id)
        const h = heights[idx]

        // Slot vuoto o non attivo
        if (!slot || !slot.attivo || slot.tipo === 'vuoto') {
          return (
            <div key={id} style={{
              width: 140, height: h, borderRadius: 10,
              background: 'rgba(74,124,142,0.03)',
              border: '1px dashed rgba(74,124,142,0.15)',
            }} />
          )
        }

        // Contenuto banner
        const hasVideo = !!(slot.videoUrl && getEmbedUrl(slot.videoUrl))
        const embedUrl = hasVideo
          ? getEmbedUrl(slot.videoUrl!) + '&autoplay=1&mute=1&loop=1&controls=0&playsinline=1'
          : null

        const bannerContent = (
          <div style={{
            width: 140, height: h, borderRadius: 10,
            background: hasVideo ? '#000' : (slot.coloresfondo || '#4a7c8e'),
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: hasVideo ? 0 : 12,
            cursor: 'pointer', overflow: 'hidden',
            position: 'relative', transition: 'opacity 0.15s, transform 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.01)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}>
            {/* Video YouTube/Vimeo con autoplay muto */}
            {hasVideo && embedUrl && (
              <>
                <iframe
                  src={embedUrl}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                {/* Layer cliccabile che apre YouTube */}
                <a
                  href={slot.urlEsterno || slot.videoUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'pointer' }}
                  aria-label="Guarda su YouTube"
                />
              </>
            )}
            {/* Immagine di sfondo - solo se no video */}
            {slot.immagineUrl && !hasVideo && (
              <img src={slot.immagineUrl} alt="" style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', opacity: 0.85,
              }} />
            )}
            {/* Testi - solo se no video */}
            {!hasVideo && (
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                {slot.titolo && (
                  <div style={{
                    fontSize: 14, fontWeight: 800, lineHeight: 1.25,
                    color: slot.coloretesto || '#fff',
                    marginBottom: slot.sottotitolo ? 6 : 0,
                  }}>
                    {slot.titolo}
                  </div>
                )}
                {slot.sottotitolo && (
                  <div style={{ fontSize: 12, color: slot.coloretesto || '#fff', opacity: 0.9, lineHeight: 1.3 }}>
                    {slot.sottotitolo}
                  </div>
                )}
              </div>
            )}
          </div>
        )

        // Link esterno
        if (slot.tipo === 'esterno' && slot.urlEsterno) {
          return (
            <a key={id} href={slot.urlEsterno}
              target={slot.apriNuovaTab !== false ? '_blank' : '_self'}
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', display: 'block' }}>
              {bannerContent}
            </a>
          )
        }

        // Pagina interna
        if (slot.tipo === 'interno' && slot.paginaInterna) {
          return (
            <Link key={id} href={slot.paginaInterna} style={{ textDecoration: 'none', display: 'block' }}>
              {bannerContent}
            </Link>
          )
        }

        return <div key={id}>{bannerContent}</div>
      })}
    </aside>
  )
}
