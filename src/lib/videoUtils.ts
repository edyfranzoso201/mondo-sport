/**
 * Estrae l'URL embed da un link YouTube o Vimeo
 * Supporta tutti i formati:
 * - https://www.youtube.com/watch?v=XXXX
 * - https://youtu.be/XXXX
 * - https://www.youtube.com/shorts/XXXX
 * - https://vimeo.com/XXXX
 */
export function getEmbedUrl(url: string): string | null {
  if (!url) return null

  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`
  }

  return null
}

export function isVideoUrl(url: string): boolean {
  return getEmbedUrl(url) !== null
}
