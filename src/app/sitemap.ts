import { MetadataRoute } from 'next'
import { SPORT_LABELS, REGIONI_ITALIA } from '@/types'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mondo-sport.vercel.app'
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/registrazione`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/accedi`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Pagine per sport
  const sportPages: MetadataRoute.Sitemap = Object.keys(SPORT_LABELS).map(sport => ({
    url: `${base}/annunci/${sport}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // Pagine per regione
  const regionePages: MetadataRoute.Sitemap = REGIONI_ITALIA
    .filter(r => !r.startsWith('—'))
    .map(regione => ({
      url: `${base}/regione/${regione.toLowerCase()}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }))

  return [...staticPages, ...sportPages, ...regionePages]
}
