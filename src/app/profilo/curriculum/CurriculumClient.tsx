'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Save, ArrowLeft, Lock, Check, Loader2, Trophy, Award, Ruler } from 'lucide-react'
import { SPORT_LABELS, RUOLI_PER_SPORT, CATEGORIE } from '@/types'
import type { CurriculumSportivo, EsperienzaSportiva, Sport } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  userId: string
  curriculum: CurriculumSportivo | null
}

const DEFAULT_CV: CurriculumSportivo = {
  userId: '',
  esperienze: [],
  titoli: [],
  qualifiche: [],
  visibile: false,
  updatedAt: '',
}

export default function CurriculumClient({ userId, curriculum: initial }: Props) {
  const [cv, setCv] = useState<CurriculumSportivo>(initial || { ...DEFAULT_CV, userId })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [nuovoTitolo, setNuovoTitolo] = useState('')
  const [nuovaQualifica, setNuovaQualifica] = useState('')

  const updCv = (key: keyof CurriculumSportivo, val: any) =>
    setCv(c => ({ ...c, [key]: val }))

  const aggiungiEsperienza = () => {
    const nuova: EsperienzaSportiva = {
      id: uuidv4(), societa: '', ruolo: '', sport: 'calcio',
      dal: '', al: '', categoria: '', note: '',
    }
    updCv('esperienze', [...cv.esperienze, nuova])
  }

  const aggiornaEsperienza = (id: string, key: keyof EsperienzaSportiva, val: any) =>
    updCv('esperienze', cv.esperienze.map(e => e.id === id ? { ...e, [key]: val } : e))

  const eliminaEsperienza = (id: string) =>
    updCv('esperienze', cv.esperienze.filter(e => e.id !== id))

  const aggiungiTitolo = () => {
    if (!nuovoTitolo.trim()) return
    updCv('titoli', [...cv.titoli, nuovoTitolo.trim()])
    setNuovoTitolo('')
  }

  const aggiungiQualifica = () => {
    if (!nuovaQualifica.trim()) return
    updCv('qualifiche', [...cv.qualifiche, nuovaQualifica.trim()])
    setNuovaQualifica('')
  }

  const salva = async () => {
    setSaving(true)
    const res = await fetch('/api/curriculum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cv),
    })
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Link href="/profilo" style={{ color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
          <ArrowLeft size={15} /> Profilo
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>
            Curriculum Sportivo
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
            Compila il tuo percorso sportivo — sarà visibile agli utenti registrati nella versione premium
          </p>
        </div>
        <button onClick={salva} disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {saving ? <><Loader2 size={15} className="spinner" /> Salvo...</>
            : saved ? <><Check size={15} /> Salvato!</>
            : <><Save size={15} /> Salva curriculum</>}
        </button>
      </div>

      {/* Banner visibilità */}
      <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Lock size={16} style={{ color: '#d97706', flexShrink: 0 }} />
        <div>
          <span style={{ fontWeight: 600, color: '#92400e', fontSize: 14 }}>Curriculum privato</span>
          <span style={{ color: '#b45309', fontSize: 13 }}> — Visibile solo a te. La visibilità pubblica sarà disponibile con la versione Premium.</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Dati fisici */}
        <Section title="Dati fisici" icon={<Ruler size={16} />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            <div>
              <label className="ms-label">Altezza (cm)</label>
              <input type="number" className="ms-input" min={140} max={220}
                value={cv.altezza || ''} onChange={e => updCv('altezza', Number(e.target.value) || undefined)}
                placeholder="Es. 178" />
            </div>
            <div>
              <label className="ms-label">Peso (kg)</label>
              <input type="number" className="ms-input" min={40} max={150}
                value={cv.peso || ''} onChange={e => updCv('peso', Number(e.target.value) || undefined)}
                placeholder="Es. 75" />
            </div>
            <div>
              <label className="ms-label">Piede predominante</label>
              <select className="ms-select" value={cv.piedePredominante || ''}
                onChange={e => updCv('piedePredominante', e.target.value || undefined)}>
                <option value="">Non specificato</option>
                <option value="destro">Destro</option>
                <option value="sinistro">Sinistro</option>
                <option value="ambidestro">Ambidestro</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="ms-label">Note / Presentazione</label>
            <textarea className="ms-input" rows={3}
              style={{ resize: 'vertical', fontFamily: 'Barlow, sans-serif' }}
              value={cv.note || ''}
              onChange={e => updCv('note', e.target.value)}
              placeholder="Descriviti brevemente: il tuo stile di gioco, punti di forza, obiettivi..."
            />
          </div>
        </Section>

        {/* Esperienze */}
        <Section title="Esperienze sportive" icon={<Trophy size={16} />}
          action={<button onClick={aggiungiEsperienza} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            <Plus size={13} /> Aggiungi
          </button>}>
          {cv.esperienze.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af' }}>
              <p style={{ fontSize: 14 }}>Nessuna esperienza aggiunta</p>
              <button onClick={aggiungiEsperienza} className="btn-secondary" style={{ marginTop: 8, fontSize: 13 }}>
                + Aggiungi prima esperienza
              </button>
            </div>
          ) : cv.esperienze.map((esp, i) => (
            <div key={esp.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, marginBottom: 12, background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>Esperienza #{i + 1}</span>
                <button onClick={() => eliminaEsperienza(esp.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 3, fontSize: 12 }}>
                  <Trash2 size={13} /> Rimuovi
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="ms-label" style={{ fontSize: 11 }}>Società / Club *</label>
                  <input className="ms-input" style={{ fontSize: 13 }} value={esp.societa}
                    onChange={e => aggiornaEsperienza(esp.id, 'societa', e.target.value)}
                    placeholder="Es. ASD Juventus Academy" />
                </div>
                <div>
                  <label className="ms-label" style={{ fontSize: 11 }}>Sport *</label>
                  <select className="ms-select" style={{ fontSize: 13 }} value={esp.sport}
                    onChange={e => aggiornaEsperienza(esp.id, 'sport', e.target.value)}>
                    {Object.entries(SPORT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="ms-label" style={{ fontSize: 11 }}>Ruolo *</label>
                  <select className="ms-select" style={{ fontSize: 13 }} value={esp.ruolo}
                    onChange={e => aggiornaEsperienza(esp.id, 'ruolo', e.target.value)}>
                    <option value="">Seleziona ruolo</option>
                    {RUOLI_PER_SPORT[esp.sport as Sport].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="ms-label" style={{ fontSize: 11 }}>Categoria</label>
                  <select className="ms-select" style={{ fontSize: 13 }} value={esp.categoria}
                    onChange={e => aggiornaEsperienza(esp.id, 'categoria', e.target.value)}>
                    <option value="">Seleziona</option>
                    {CATEGORIE.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="ms-label" style={{ fontSize: 11 }}>Dal (anno)</label>
                  <input type="number" className="ms-input" style={{ fontSize: 13 }}
                    min={1980} max={new Date().getFullYear()}
                    value={esp.dal} onChange={e => aggiornaEsperienza(esp.id, 'dal', e.target.value)}
                    placeholder="Es. 2018" />
                </div>
                <div>
                  <label className="ms-label" style={{ fontSize: 11 }}>Al (anno, vuoto = in corso)</label>
                  <input type="number" className="ms-input" style={{ fontSize: 13 }}
                    min={1980} max={new Date().getFullYear()}
                    value={esp.al || ''} onChange={e => aggiornaEsperienza(esp.id, 'al', e.target.value)}
                    placeholder="In corso" />
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <label className="ms-label" style={{ fontSize: 11 }}>Note (presenze, gol, ecc.)</label>
                <input className="ms-input" style={{ fontSize: 13 }} value={esp.note || ''}
                  onChange={e => aggiornaEsperienza(esp.id, 'note', e.target.value)}
                  placeholder="Es. 24 presenze, 8 gol in campionato" />
              </div>
            </div>
          ))}
        </Section>

        {/* Titoli */}
        <Section title="Titoli e trofei" icon={<Award size={16} />}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {cv.titoli.map((t, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                🏆 {t}
                <button onClick={() => updCv('titoli', cv.titoli.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d97706', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="ms-input" style={{ flex: 1 }} value={nuovoTitolo}
              onChange={e => setNuovoTitolo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && aggiungiTitolo()}
              placeholder="Es. Campione Regionale Under 16 — 2021" />
            <button onClick={aggiungiTitolo} className="btn-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
              <Plus size={15} />
            </button>
          </div>
        </Section>

        {/* Qualifiche */}
        <Section title="Qualifiche e patenti" icon={<Award size={16} />}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {cv.qualifiche.map((q, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ms-green-light)', color: 'var(--ms-green)', padding: '4px 10px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                🎓 {q}
                <button onClick={() => updCv('qualifiche', cv.qualifiche.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ms-green)', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="ms-input" style={{ flex: 1 }} value={nuovaQualifica}
              onChange={e => setNuovaQualifica(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && aggiungiQualifica()}
              placeholder="Es. Patente UEFA B, Corso preparatore atletico FIFa" />
            <button onClick={aggiungiQualifica} className="btn-primary" style={{ padding: '8px 16px' }}>
              <Plus size={15} />
            </button>
          </div>
        </Section>

      </div>

      {/* Salva bottom */}
      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={salva} disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 28px' }}>
          {saving ? <><Loader2 size={15} className="spinner" /> Salvo...</>
            : saved ? <><Check size={15} /> Salvato!</>
            : <><Save size={15} /> Salva curriculum</>}
        </button>
      </div>
    </div>
  )
}

function Section({ title, icon, action, children }: { title: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 15, color: '#111' }}>
          <span style={{ color: 'var(--ms-green)' }}>{icon}</span>
          {title}
        </div>
        {action}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  )
}
