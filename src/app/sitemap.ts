import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mondo-sport.vercel.app'
  const now = new Date()

  return [
    { url: base,                              lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/registrazione`,           lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/accedi`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/mappa`,                   lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/?sport=calcio`,           lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/?sport=calcio5`,          lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/?sport=pallavolo`,        lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/?sport=basket`,           lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/?sport=padel`,            lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/?sport=softair`,          lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/?regione=Piemonte`,       lastModified: now, changeFrequency: 'daily',   priority: 0.85 },
    { url: `${base}/?regione=Toscana`,        lastModified: now, changeFrequency: 'daily',   priority: 0.85 },
    { url: `${base}/?regione=Lombardia`,      lastModified: now, changeFrequency: 'daily',   priority: 0.85 },
    { url: `${base}/?tipo=ricerca_squadra`,   lastModified: now, changeFrequency: 'daily',   priority: 0.85 },
    { url: `${base}/?tipo=cerca_atleti`,      lastModified: now, changeFrequency: 'daily',   priority: 0.85 },
    { url: `${base}/?tipo=torneo`,            lastModified: now, changeFrequency: 'daily',   priority: 0.80 },
    { url: `${base}/?tipo=amichevole`,        lastModified: now, changeFrequency: 'daily',   priority: 0.80 },
    { url: `${base}/?tipo=cerca_sponsor`,         lastModified: now, changeFrequency: 'daily', priority: 0.80 },
    { url: `${base}/?tipo=offre_sponsorizzazione`, lastModified: now, changeFrequency: 'daily', priority: 0.80 },
    { url: `${base}/?sport=preparatore`,  lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${base}/?sport=arbitro`,      lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${base}/?sport=allenatore`,   lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${base}/?sport=atletica`,     lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${base}/?tipo=gara`,          lastModified: now, changeFrequency: 'daily', priority: 0.80 },
  ]
}
