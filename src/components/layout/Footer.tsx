'use client'
import Link from 'next/link'

export default function Footer() {
  const anno = new Date().getFullYear()

  return (
    <footer style={{
      background: 'var(--ms-green-dark)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '20px 24px 16px',
    }}>
      <style>{`
        .fl { color: rgba(255,255,255,0.65); font-size: 12px; text-decoration: none; display: block; line-height: 1.9; }
        .fl:hover { color: #fff; }
        .fls { color: rgba(255,255,255,0.4); font-size: 11px; text-decoration: none; }
        .fls:hover { color: rgba(255,255,255,0.75); }
        .fcol-title { color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 6px; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Riga principale */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 16 }}>

          {/* Brand */}
          <div style={{ flex: '0 0 160px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="13" stroke="white" strokeWidth="1.5"/>
                <path d="M14 1 Q18 7 14 14 Q10 7 14 1" fill="white" opacity="0.8"/>
                <path d="M1 14 Q7 10 14 14 Q7 18 1 14" fill="white" opacity="0.8"/>
                <path d="M27 14 Q21 18 14 14 Q21 10 27 14" fill="white" opacity="0.8"/>
                <path d="M14 27 Q10 21 14 14 Q18 21 14 27" fill="white" opacity="0.8"/>
              </svg>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#fff' }}>
                MONDO SPORT
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: 0, lineHeight: 1.5 }}>
              Piattaforma per atleti,<br />allenatori e società sportive.
            </p>
          </div>

          {/* Colonne link */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, minWidth: 0 }}>

            {/* A1 — Piattaforma col 1 */}
            <div>
              <p className="fcol-title">Piattaforma</p>
              <Link href="/" className="fl">Annunci</Link>
              <Link href="/mappa" className="fl">Mappa</Link>
            </div>

            {/* A2 — Piattaforma col 2 */}
            <div>
              <p className="fcol-title">&nbsp;</p>
              <Link href="/registrazione" className="fl">Registrati</Link>
              <Link href="/accedi" className="fl">Accedi</Link>
            </div>

            {/* B1 — Sport col 1 */}
            <div>
              <p className="fcol-title">Sport</p>
              <Link href="/?sport=calcio" className="fl">⚽ Calcio</Link>
              <Link href="/?sport=calcio5" className="fl">🥅 Calcio a 5</Link>
              <Link href="/?sport=pallavolo" className="fl">🏐 Pallavolo</Link>
            </div>

            {/* B2 — Sport col 2 */}
            <div>
              <p className="fcol-title">&nbsp;</p>
              <Link href="/?sport=basket" className="fl">🏀 Basket</Link>
              <Link href="/?sport=padel" className="fl">🎾 Padel</Link>
            </div>

            {/* C — Contatti */}
            <div>
              <p className="fcol-title">Contatti</p>
              <a href="mailto:info.mondo2026@gmail.com" className="fl">📧 info.mondo2026@gmail.com</a>
              <a href="mailto:info.mondo2026@gmail.com" className="fl">🔒 Privacy</a>
            </div>

          </div>
        </div>

        {/* Striscia copyright */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, margin: 0, lineHeight: 1.6 }}>
            © {anno} Mondo Sport — Tutti i diritti riservati. &nbsp;·&nbsp;
            Servizio di informazione sportiva ai sensi della L. 62/2001. &nbsp;·&nbsp;
            Dati trattati nel rispetto del GDPR UE 2016/679 e D.Lgs. 196/2003.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="mailto:info.mondo2026@gmail.com" className="fls">Privacy Policy</a>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>·</span>
            <a href="mailto:info.mondo2026@gmail.com" className="fls">Contattaci</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
