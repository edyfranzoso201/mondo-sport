import type { MediaDrive, TipoMediaDrive } from '@/types'

export function estraiIdDrive(url: string): string | null {
  if (!url) return null
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (m1) return m1[1]
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (m2) return m2[1]
  return null
}

export function rilevaTipoMedia(url: string): TipoMediaDrive {
  const lower = url.toLowerCase()
  if (lower.includes('.pdf')) return 'pdf'
  if (lower.includes('.jpg') || lower.includes('.jpeg') ||
      lower.includes('.png') || lower.includes('.gif') || lower.includes('.webp')) {
    return 'immagine'
  }
  return 'video'
}

export function isLinkDriveValido(url: string): boolean {
  if (!url) return false
  return url.includes('drive.google.com') || url.includes('docs.google.com')
}

export function processaUrlMedia(urls: string[]): MediaDrive[] {
  return urls
    .map(url => url.trim())
    .filter(url => url.length > 0 && isLinkDriveValido(url))
    .slice(0, 5)
    .map(url => ({ url, tipo: rilevaTipoMedia(url) }))
}
// Aggiunta per compatibilità con AdPopup.tsx
export function getEmbedUrl(url: string): string {
  const id = estraiIdDrive(url)
  if (!id) return url
  return `https://drive.google.com/file/d/${id}/preview`
}