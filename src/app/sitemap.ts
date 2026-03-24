import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mondo-sport.vercel.app'
  const now = new Date()

  return [
    // Pagine principali
    { url: base,                          lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/registrazione`,       lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/accedi`,              lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/mappa`,              lastModified: now, changeFrequency: 'daily',   priority: 0.8 },

    // Annunci per sport (filtri homepage)
    { url: `${base}/?sport=calcio`,       lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/?sport=calcio5`,      lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/?sport=pallavolo`,    lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/?sport=basket`,       lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/?sport=padel`,        lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/?sport=softair`,      lastModified: now, changeFrequency: 'daily',   priority: 0.8 },

    // Annunci per regione
    { url: `${base}/?regione=Piemonte`,   lastModified: now, changeFrequency: 'daily',   priority: 0.85 },
    { url: `${base}/?regione=Toscana`,    lastModified: now, changeFrequency: 'daily',   priority: 0.85 },
    { url: `${base}/?regione=Lombardia`,  lastModified: now, changeFrequency: 'daily',   priority: 0.85 },

    // Annunci per tipo
    { url: `${base}/?tipo=ricerca_squadra`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${base}/?tipo=cerca_atleti`,    lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${base}/?tipo=torneo`,          lastModified: now, changeFrequency: 'daily', priority: 0.80 },
    { url: `${base}/?tipo=amichevole`,      lastModified: now, changeFrequency: 'daily', priority: 0.80 },

    // Combinazioni sport + regione più importanti
    { url: `${base}/?sport=calcio&regione=Piemonte`,    lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${base}/?sport=calcio&regione=Toscana`,     lastModified: now, changeFrequency: 'daily', priority: 0.80 },
    { url: `${base}/?sport=calcio&regione=Lombardia`,   lastModified: now, changeFrequency: 'daily', priority: 0.80 },
    { url: `${base}/?sport=pallavolo&regione=Piemonte`, lastModified: now, changeFrequency: 'daily', priority: 0.80 },
    { url: `${base}/?sport=basket&regione=Piemonte`,    lastModified: now, changeFrequency: 'daily', priority: 0.80 },
    { url: `${base}/?sport=padel&regione=Piemonte`,     lastModified: now, changeFrequency: 'daily', priority: 0.80 },
  ]
}
