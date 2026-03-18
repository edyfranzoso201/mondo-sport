'use client'
import { useEffect, useRef } from 'react'

interface GruppoComune {
  comune: string; lat: number; lon: number; count: number; distanza: number
  profili: Array<{ id:string; alias:string; annoDiNascita:number; ruoli:string[]; sport:string[]; statoAnnuncio:string }>
}

interface Props {
  centro: [number, number]
  gruppi: GruppoComune[]
  onGruppoClick: (g: GruppoComune) => void
  gruppoSelezionato: GruppoComune | null
}

export default function MapComponent({ centro, gruppi, onGruppoClick, gruppoSelezionato }: Props) {
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const centerMarkerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Init mappa — una sola volta, con cleanup
  useEffect(() => {
    // Delay per assicurarsi che il DOM sia pronto
    const timer = setTimeout(() => {
      if (initializedRef.current) return
      if (!containerRef.current) return

      import('leaflet').then(L => {
        const container = containerRef.current
        if (!container) return
        if (initializedRef.current) return

        // Pulisce eventuali residui Leaflet sul container
        if ((container as any)._leaflet_id) {
          try {
            (container as any)._leaflet_id = null
            container.innerHTML = ''
          } catch {}
        }

        // Fix icone
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })

        try {
          const map = L.map(container, {
            center: centro,
            zoom: 11,
            zoomControl: true,
          })

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
            maxZoom: 18,
          }).addTo(map)

          mapRef.current = map
          initializedRef.current = true

          cleanupRef.current = () => {
            try {
              markersRef.current.forEach(m => m.remove())
              markersRef.current = []
              if (centerMarkerRef.current) centerMarkerRef.current.remove()
              centerMarkerRef.current = null
              map.remove()
            } catch {}
            mapRef.current = null
            initializedRef.current = false
          }
        } catch (e) {
          console.warn('Leaflet init error:', e)
        }
      })
    }, 50) // piccolo delay per garantire DOM montato

    return () => {
      clearTimeout(timer)
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Aggiorna centro
  useEffect(() => {
    if (!mapRef.current) return
    try { mapRef.current.setView(centro, 11) } catch {}
  }, [centro])

  // Aggiorna markers
  useEffect(() => {
    if (!mapRef.current || !initializedRef.current) return

    import('leaflet').then(L => {
      if (!mapRef.current) return

      // Rimuovi vecchi markers
      markersRef.current.forEach(m => { try { m.remove() } catch {} })
      markersRef.current = []
      if (centerMarkerRef.current) {
        try { centerMarkerRef.current.remove() } catch {}
        centerMarkerRef.current = null
      }

      // Marker casa
      const homeIcon = L.divIcon({
        className: '',
        html: `<div style="width:34px;height:34px;border-radius:50%;background:#e8a030;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,0.3);font-size:18px;line-height:1;">🏠</div>`,
        iconSize: [34, 34], iconAnchor: [17, 17],
      })

      try {
        centerMarkerRef.current = L.marker(centro, { icon: homeIcon })
          .addTo(mapRef.current)
          .bindPopup('<strong>La tua posizione</strong>')
      } catch {}

      // Marker comuni
      gruppi.forEach(gruppo => {
        const isSelected = gruppoSelezionato?.comune === gruppo.comune
        const size = Math.max(36, Math.min(20 + gruppo.count * 8, 64))
        const bg = isSelected ? '#e8a030' : '#4a7c8e'
        const border = isSelected ? '#fff' : 'rgba(255,255,255,0.9)'
        const shadow = isSelected ? '0 3px 14px rgba(232,160,48,0.6)' : '0 3px 10px rgba(74,124,142,0.4)'

        const icon = L.divIcon({
          className: '',
          html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:2.5px solid ${border};display:flex;align-items:center;justify-content:center;box-shadow:${shadow};cursor:pointer;position:relative;" onmouseenter="this.style.transform='scale(1.12)'" onmouseleave="this.style.transform='scale(1)'">
            <svg width="${size-8}" height="${size-8}" viewBox="0 0 30 30" style="position:absolute;opacity:0.2;pointer-events:none">
              <circle cx="15" cy="15" r="13" fill="none" stroke="white" stroke-width="2"/>
              <path d="M15 2 Q19 9 15 15 Q11 9 15 2" fill="white"/>
              <path d="M2 15 Q9 11 15 15 Q9 19 2 15" fill="white"/>
              <path d="M28 15 Q21 19 15 15 Q21 11 28 15" fill="white"/>
            </svg>
            <span style="color:#fff;font-weight:800;font-size:${size > 48 ? 16 : 13}px;font-family:Barlow,sans-serif;position:relative;z-index:1;text-shadow:0 1px 3px rgba(0,0,0,0.4);">${gruppo.count}</span>
          </div>`,
          iconSize: [size, size], iconAnchor: [size/2, size/2],
        })

        try {
          const marker = L.marker([gruppo.lat, gruppo.lon], { icon })
            .addTo(mapRef.current)
            .bindTooltip(`<strong>${gruppo.comune}</strong><br>${gruppo.count} ${gruppo.count === 1 ? 'utente' : 'utenti'}`, {
              direction: 'top', offset: [0, -(size/2 + 4)],
            })
            .on('click', () => onGruppoClick(gruppo))
          markersRef.current.push(marker)
        } catch {}
      })
    })
  }, [gruppi, gruppoSelezionato, centro, onGruppoClick])

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </>
  )
}
