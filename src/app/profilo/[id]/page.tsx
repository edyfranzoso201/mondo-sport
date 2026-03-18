import { auth } from '@/lib/auth'
import { getProfilo } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, MessageCircle, Lock, ArrowLeft } from 'lucide-react'
import { SPORT_LABELS } from '@/types'
import type { Sport } from '@/types'

const SPORT_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  calcio:    { bg: '#e8f5ee', text: '#1a6b3a', bar: '#1a6b3a' },
  pallavolo: { bg: '#e6f0fb', text: '#1a4fa8', bar: '#1a4fa8' },
  basket:    { bg: '#faeada', text: '#b84a0e', bar: '#b84a0e' },
}

export default async function ProfiloPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const isGuest = !session?.user
  const profilo = await getProfilo(id)

  if (!profilo || profilo.statoAnnuncio === 'nascosto') notFound()

  const sport = profilo.sportPrimario
  const colors = SPORT_COLORS[sport] || SPORT_COLORS.calcio
  const nome = profilo.nomeSocieta || profilo.alias
  const initials = nome.split(/[_\s]/).slice(0, 2).map((w: string) => w[0]?.toUpperCase() || '').join('')

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 20px' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6b7280', textDecoration: 'none', fontSize: 14, marginBottom: 20 }}>
        <ArrowLeft size={15} /> Torna agli annunci
      </Link>

      {/* Card profilo */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
        {/* Sport bar */}
        <div style={{ height: 6, background: colors.bar }} />

        <div style={{ padding: '28px 28px 0' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <div style={{
              width: 72, height: 72,
              borderRadius: profilo.tipo === 'societa' ? 16 : '50%',
              background: colors.bg, color: colors.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 700, flexShrink: 0,
            }}>
              {initials || '?'}
            </div>
            <div>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 700, margin: '0 0 6px' }}>
                {nome}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: '#6b7280' }}>
                  <MapPin size={13} /> {profilo.comune}, {profilo.regione}
                </span>
                {profilo.annoDiNascita > 1900 && (
                  <span style={{ fontSize: 14, color: '#6b7280' }}>· Anno {profilo.annoDiNascita}</span>
                )}
                <span style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
                  background: profilo.tipo === 'atleta' ? '#f3e8ff' : profilo.tipo === 'societa' ? '#e0f2fe' : '#fef3c7',
                  color: profilo.tipo === 'atleta' ? '#7c3aed' : profilo.tipo === 'societa' ? '#0369a1' : '#92400e',
                  padding: '2px 8px', borderRadius: 10,
                }}>
                  {profilo.tipo === 'atleta' ? 'Atleta' : profilo.tipo === 'societa' ? 'Società' : 'Staff tecnico'}
                </span>
              </div>
            </div>
          </div>

          {/* Stato */}
          <div style={{ marginBottom: 24 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              background: profilo.statoAnnuncio === 'disponibile' ? '#d1fae5' : '#dbeafe',
              color: profilo.statoAnnuncio === 'disponibile' ? '#065f46' : '#1e40af',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              {profilo.statoAnnuncio === 'disponibile' ? 'Disponibile' : 'Cerca squadra'}
            </span>
          </div>
        </div>

        {/* Dettagli */}
        <div style={{ padding: '0 28px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Sport */}
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af', margin: '0 0 10px' }}>
              Sport
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profilo.sport.map((s: string) => (
                <span key={s} style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  background: SPORT_COLORS[s]?.bg || '#f3f4f6',
                  color: SPORT_COLORS[s]?.text || '#374151',
                }}>
                  {SPORT_LABELS[s as Sport] || s}
                </span>
              ))}
            </div>
          </div>

          {/* Ruoli */}
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af', margin: '0 0 10px' }}>
              Ruoli
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profilo.ruoli.map((r: string) => (
                <span key={r} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 13, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Categorie */}
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af', margin: '0 0 10px' }}>
              Categorie
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profilo.categoria.map((c: string) => (
                <span key={c} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 13, background: '#fef3c7', color: '#92400e' }}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Pubblicato */}
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af', margin: '0 0 10px' }}>
              Membro da
            </h3>
            <span style={{ fontSize: 14, color: '#374151' }}>
              {new Date(profilo.createdAt).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* CTA Contatto */}
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '20px 28px', background: '#fafafa' }}>
          {isGuest ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Vuoi contattare {nome}?</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>Registrati o accedi per avviare una chat privata</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/accedi" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px' }}>
                  <Lock size={14} /> Accedi
                </Link>
                <Link href="/registrazione" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px' }}>
                  Registrati
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Contatta {nome} direttamente tramite chat interna</p>
              <StartChatButton profiloId={id} nome={nome} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StartChatButton({ profiloId, nome }: { profiloId: string; nome: string }) {
  // Client component inline via server wrapper trick — use Link for now
  return (
    <Link
      href={`/chat?avvia=${profiloId}`}
      className="btn-primary"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      <MessageCircle size={16} /> Avvia chat con {nome}
    </Link>
  )
}
