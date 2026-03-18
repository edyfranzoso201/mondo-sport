'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, ExternalLink, FileText, Save, Loader2, Check, X } from 'lucide-react'
import type { Documento } from '@/lib/db'

const ICONE = ['📄', '📋', '📑', '📜', '🏆', '⚽', '🏐', '🏀', '🎾', '📌', '✅', '🔒', '📊', '🗺️']
const TIPI = [
  { v: 'pdf', l: 'PDF', icon: '📄' },
  { v: 'link', l: 'Link', icon: '🔗' },
  { v: 'altro', l: 'Altro documento', icon: '📋' },
]

interface Props { documentiIniziali: Documento[] }

export default function DocumentiClient({ documentiIniziali }: Props) {
  const [docs, setDocs] = useState(documentiIniziali)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [form, setForm] = useState({
    titolo: '', descrizione: '', url: '', tipo: 'pdf', icona: '📄', visibile: true,
  })
  const [saved, setSaved] = useState(false)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)

  const upd = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const aggiungi = async () => {
    if (!form.titolo.trim() || !form.url.trim()) return
    setLoading('new')
    const res = await fetch('/api/admin/documenti', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', ...form }),
    })
    const data = await res.json()
    if (data.success) {
      setDocs(prev => [...prev, data.data])
      setForm({ titolo: '', descrizione: '', url: '', tipo: 'pdf', icona: '📄', visibile: true })
      setShowForm(false)
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    }
    setLoading(null)
  }

  const toggleVisibile = async (doc: Documento) => {
    setLoading(doc.id)
    const res = await fetch('/api/admin/documenti', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id: doc.id, visibile: !doc.visibile }),
    })
    if (res.ok) setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, visibile: !d.visibile } : d))
    setLoading(null)
  }

  const elimina = async (id: string) => {
    setLoading(id)
    await fetch('/api/admin/documenti', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    })
    setDocs(prev => prev.filter(d => d.id !== id))
    setConfirmDel(null)
    setLoading(null)
  }

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Link href="/admin" style={{ color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
          <ArrowLeft size={15} /> Pannello admin
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 700, margin: 0 }}>
            📄 Gestione Documenti
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>
            Aggiungi link a PDF o documenti visibili a tutti nella homepage. I dati sono salvati su Redis.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {showForm ? <><X size={14} /> Annulla</> : <><Plus size={14} /> Aggiungi documento</>}
        </button>
      </div>

      {/* Form aggiunta */}
      {showForm && (
        <div style={{ background: '#fff', border: '1.5px solid var(--ms-green)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: 'var(--ms-green)' }}>
            Nuovo documento
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Icona e titolo */}
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flexShrink: 0 }}>
                <label className="ms-label" style={{ fontSize: 12 }}>Icona</label>
                <select className="ms-select" style={{ width: 70, fontSize: 18, padding: '6px 4px', textAlign: 'center' }}
                  value={form.icona} onChange={e => upd('icona', e.target.value)}>
                  {ICONE.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="ms-label" style={{ fontSize: 12 }}>Titolo <span className="required">*</span></label>
                <input className="ms-input" value={form.titolo} onChange={e => upd('titolo', e.target.value)}
                  placeholder="Es. Regolamento tornei 2026" />
              </div>
              <div style={{ flexShrink: 0 }}>
                <label className="ms-label" style={{ fontSize: 12 }}>Tipo</label>
                <select className="ms-select" style={{ width: 120 }} value={form.tipo} onChange={e => upd('tipo', e.target.value)}>
                  {TIPI.map(t => <option key={t.v} value={t.v}>{t.icon} {t.l}</option>)}
                </select>
              </div>
            </div>

            {/* Descrizione */}
            <div>
              <label className="ms-label" style={{ fontSize: 12 }}>Descrizione breve</label>
              <input className="ms-input" value={form.descrizione} onChange={e => upd('descrizione', e.target.value)}
                placeholder="Es. Regole e format per i tornei organizzati su Mondo Sport" />
            </div>

            {/* URL */}
            <div>
              <label className="ms-label" style={{ fontSize: 12 }}>URL documento <span className="required">*</span></label>
              <input className="ms-input" type="url" value={form.url} onChange={e => upd('url', e.target.value)}
                placeholder="https://drive.google.com/file/d/... oppure https://dropbox.com/..." />
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '5px 0 0' }}>
                💡 Google Drive: condividi il file → "Chiunque abbia il link" → copia il link
              </p>
            </div>

            {/* Visibilità */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 12px', background: '#f8fbfc', borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <input type="checkbox" checked={form.visibile} onChange={e => upd('visibile', e.target.checked)}
                style={{ width: 15, height: 15, accentColor: 'var(--ms-green)' }} />
              <span style={{ fontSize: 14 }}>Visibile subito in homepage</span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn-ghost" onClick={() => setShowForm(false)}>Annulla</button>
              <button className="btn-primary" onClick={aggiungi} disabled={loading === 'new' || !form.titolo || !form.url}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {loading === 'new' ? <><Loader2 size={14} className="spinner" /> Salvo...</>
                  : saved ? <><Check size={14} /> Salvato!</>
                  : <><Save size={14} /> Aggiungi</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista documenti */}
      {docs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: '#fff', border: '1px solid #d0dde2', borderRadius: 12, color: '#9ca3af' }}>
          <FileText size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: 15 }}>Nessun documento ancora.</p>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>Clicca "Aggiungi documento" per iniziare.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {docs.map(doc => (
            <div key={doc.id} style={{
              background: '#fff', border: `1px solid ${doc.visibile ? '#d0dde2' : '#e5e7eb'}`,
              borderRadius: 10, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              opacity: doc.visibile ? 1 : 0.6,
            }}>
              {/* Icona */}
              <div style={{ fontSize: 28, flexShrink: 0 }}>{doc.icona || '📄'}</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.titolo}
                  </span>
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: doc.visibile ? '#d8eff0' : '#f3f4f6', color: doc.visibile ? '#2a6e78' : '#9ca3af', fontWeight: 700, flexShrink: 0 }}>
                    {doc.visibile ? '● Visibile' : '○ Nascosto'}
                  </span>
                </div>
                {doc.descrizione && (
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.descrizione}
                  </p>
                )}
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: 'var(--ms-green)', display: 'inline-flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
                  <ExternalLink size={10} />
                  {doc.url.length > 60 ? doc.url.slice(0, 60) + '...' : doc.url}
                </a>
              </div>

              {/* Azioni */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => toggleVisibile(doc)} title={doc.visibile ? 'Nascondi' : 'Mostra'}
                  style={{ padding: '6px 10px', background: doc.visibile ? '#f0f4f5' : 'var(--ms-green-light)', color: doc.visibile ? '#6b7280' : 'var(--ms-green)', border: '1px solid #d0dde2', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'Barlow, sans-serif' }}>
                  {doc.visibile ? <><EyeOff size={13} /> Nascondi</> : <><Eye size={13} /> Mostra</>}
                </button>

                {confirmDel === doc.id ? (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#dc2626' }}>Eliminare?</span>
                    <button onClick={() => elimina(doc.id)}
                      style={{ padding: '5px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'Barlow, sans-serif' }}>Sì</button>
                    <button onClick={() => setConfirmDel(null)}
                      style={{ padding: '5px 8px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'Barlow, sans-serif' }}>No</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDel(doc.id)}
                    style={{ padding: '6px 10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'Barlow, sans-serif' }}>
                    <Trash2 size={13} /> Elimina
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: 11, color: '#b0bec5', margin: '16px 0 0', textAlign: 'center' }}>
        I documenti vengono eliminati completamente da Redis quando clicchi "Elimina". I link originali su Drive/Dropbox rimangono invariati.
      </p>
    </div>
  )
}
