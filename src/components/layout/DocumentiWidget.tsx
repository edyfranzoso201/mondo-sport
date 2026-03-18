'use client'
import { useEffect, useState } from 'react'
import { ExternalLink, FileText } from 'lucide-react'
import type { Documento } from '@/lib/db'

export default function DocumentiWidget() {
  const [docs, setDocs] = useState<Documento[]>([])

  useEffect(() => {
    fetch('/api/documenti')
      .then(r => r.json())
      .then(d => { if (d.success && d.data.length > 0) setDocs(d.data) })
      .catch(() => {})
  }, [])

  if (docs.length === 0) return null

  return (
    <div style={{
      background: '#fff', border: '1px solid var(--ms-border)',
      borderRadius: 12, padding: '16px 18px', marginBottom: 16,
    }}>
      <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, margin: '0 0 10px', color: 'var(--ms-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <FileText size={15} style={{ color: 'var(--ms-green)' }} />
        Documenti & Informazioni
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {docs.map(doc => (
          <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid #f0f4f5', textDecoration: 'none', transition: 'background 0.12s', background: '#fafcfd' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--ms-green-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fafcfd')}>
            <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.2 }}>{doc.icona || '📄'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ms-text)', display: 'flex', alignItems: 'center', gap: 5 }}>
                {doc.titolo}
                <ExternalLink size={10} style={{ color: 'var(--ms-green)', flexShrink: 0 }} />
              </div>
              {doc.descrizione && (
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1, lineHeight: 1.4 }}>
                  {doc.descrizione}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
