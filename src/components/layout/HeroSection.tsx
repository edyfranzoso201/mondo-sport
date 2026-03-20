import Link from 'next/link'

export default function HeroSection() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, var(--ms-green) 0%, var(--ms-green-dark) 100%)',
      padding: '18px 24px 16px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Sport */}
        <p style={{
          color: 'rgba(255,255,255,0.6)', fontSize: 11,
          margin: '0 0 10px', letterSpacing: '1px',
          textTransform: 'uppercase', fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexWrap: 'wrap', gap: '0 12px',
        }}>
          <span>⚽ Calcio</span><span style={{ opacity: 0.35 }}>·</span>
          <span>🥅 Calcio a 5</span><span style={{ opacity: 0.35 }}>·</span>
          <span>🏐 Pallavolo</span><span style={{ opacity: 0.35 }}>·</span>
          <span>🏀 Basket</span><span style={{ opacity: 0.35 }}>·</span>
          <span>🎾 Padel</span>
        </p>

        {/* Titolo su una riga + Registrazione Gratuita sotto */}
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700, margin: '0 0 12px', lineHeight: 1.2,
          fontSize: 'clamp(18px, 4vw, 36px)',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          padding: '0 8px',
        }}>
          <span style={{ color: '#fff' }}>
            Trova la tua squadra, le tue partite e i tuoi Tornei —{' '}
          </span>
          <span style={{ color: 'var(--ms-accent)' }}>Registrazione Gratuita</span>
        </h1>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link href="/registrazione" style={{
            background: 'var(--ms-accent)', color: '#1a1200',
            padding: '9px 24px', borderRadius: 8,
            fontSize: 14, fontWeight: 800, textDecoration: 'none',
            boxShadow: '0 2px 10px rgba(232,160,48,0.35)',
          }}>
            Registrati gratis
          </Link>
          <Link href="/accedi" style={{
            color: '#fff', textDecoration: 'none',
            padding: '9px 18px', borderRadius: 8,
            border: '1.5px solid rgba(255,255,255,0.35)',
            fontSize: 13, fontWeight: 600,
          }}>
            Accedi
          </Link>
        </div>
      </div>
    </section>
  )
}

// Componente SEO nascosto per le keyword
export function SeoKeywords() {
  return (
    <section style={{ padding: '32px 20px', background: '#f8fbfc', borderTop: '1px solid #e8f0f4' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, color: '#2a5a78', marginBottom: 12 }}>
          La piattaforma sportiva gratuita per atleti e società in Italia
        </h2>
        <p style={{ fontSize: 14, color: '#4a6470', lineHeight: 1.7, marginBottom: 12 }}>
          <strong>Mondo Sport</strong> è il punto di incontro tra <strong>atleti</strong> e <strong>società sportive</strong> in tutta Italia.
          Sei un <strong>portiere di calcio</strong> che cerca squadra? Un <strong>allenatore</strong> disponibile? Una <strong>società sportiva</strong> che cerca giocatori?
          Pubblica il tuo annuncio gratuitamente e fatti trovare.
        </p>
        <p style={{ fontSize: 14, color: '#4a6470', lineHeight: 1.7, marginBottom: 12 }}>
          Organizza <strong>tornei sportivi</strong> e <strong>partite amichevoli</strong> nella tua zona. Cerca squadre disponibili per <strong>amichevoli di calcio</strong>,
          <strong>tornei di pallavolo</strong>, <strong>tornei di basket</strong> e molto altro. Disponibile per <strong>calcio</strong>, <strong>calcio a 5</strong>, <strong>pallavolo</strong>, <strong>basket</strong>, <strong>padel</strong> e <strong>softair</strong>.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          {['Cerco squadra calcio', 'Organizza torneo calcio', 'Amichevole calcio', 'Cerco amichevole pallavolo',
            'Torneo basket Italia', 'Cerco giocatori calcio a 5', 'Preparatore atletico', 'Allenatore calcio',
            'Cerco portiere', 'Torneo under 12', 'Amichevole softball', 'Annunci sportivi gratis',
            'Società sportiva cerca atleti', 'Staff tecnico sportivo'].map(tag => (
            <span key={tag} style={{ padding: '4px 10px', background: '#e8f3f6', color: '#4a7c8e', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
