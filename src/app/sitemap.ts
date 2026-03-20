import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mondo-sport.vercel.app'
  const now = new Date()
  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/registrazione`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/accedi`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]
}
