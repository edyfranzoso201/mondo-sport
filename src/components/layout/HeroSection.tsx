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
          fontWeight: 700, margin: '0 0 12px', lineHeight: 1.15,
          fontSize: 'clamp(22px, 3vw, 36px)',
          whiteSpace: 'nowrap',
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
