'use client'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, MessageCircle, Bell, User, LogOut, Shield, FileText, ChevronDown, Layout } from 'lucide-react'
import { VERSIONE } from '@/lib/versione'

export default function Navbar() {
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [nonLetti, setNonLetti] = useState(0)

  const isAdmin = (session?.user as any)?.tipo === 'admin'

  // Polling messaggi non letti ogni 30 secondi
  useEffect(() => {
    if (!session?.user) return
    const fetchNonLetti = () => {
      fetch('/api/chat/nonletti')
        .then(r => r.json())
        .then(d => setNonLetti(d.totale || 0))
        .catch(() => {})
    }
    fetchNonLetti()
    const interval = setInterval(fetchNonLetti, 30000)
    return () => clearInterval(interval)
  }, [session])

  return (
    <nav style={{ background: 'var(--ms-green)', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 8px rgba(52,96,111,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 56 }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="white" strokeWidth="1.5"/>
            <path d="M14 1 Q18 7 14 14 Q10 7 14 1" fill="white" opacity="0.8"/>
            <path d="M1 14 Q7 10 14 14 Q7 18 1 14" fill="white" opacity="0.8"/>
            <path d="M27 14 Q21 18 14 14 Q21 10 27 14" fill="white" opacity="0.8"/>
            <path d="M14 27 Q10 21 14 14 Q18 21 14 27" fill="white" opacity="0.8"/>
          </svg>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
            MONDO SPORT
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">
          <Link href="/" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '6px 10px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            Annunci
            <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', padding: '1px 5px', borderRadius: 8, letterSpacing: '0.3px' }}>
              {VERSIONE}
            </span>
          </Link>
          {/* Mappa visibile a tutti gli utenti registrati */}
          {session && <NavLink href="/mappa">Mappa</NavLink>}
          {/* Mappa nel menu guest non visibile */}

          {session ? (
            <>
              {/* Icona Chat con badge */}
              <Link href="/chat" style={{ ...iconBtnStyle, position: 'relative' }} title="Chat">
                <MessageCircle size={18} />
                {nonLetti > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2,
                    background: '#e8a030', color: '#fff',
                    borderRadius: '50%', minWidth: 16, height: 16,
                    fontSize: 10, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px', lineHeight: 1,
                    border: '1.5px solid var(--ms-green)',
                  }}>
                    {nonLetti > 99 ? '99+' : nonLetti}
                  </span>
                )}
              </Link>

              {/* Icona Alert */}
              <Link href="/profilo/alert" style={iconBtnStyle} title="Alert e notifiche">
                <Bell size={18} />
              </Link>

              {/* Icona Admin */}
              {isAdmin && (
                <Link href="/admin" style={iconBtnStyle} title="Pannello admin">
                  <Shield size={18} />
                </Link>
              )}

              {/* Menu utente */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ ...iconBtnStyle, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8 }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session.user?.name}
                  </span>
                  <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
                </button>

                {dropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setDropdownOpen(false)} />
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                      background: '#fff', border: '1px solid #d0dde2',
                      borderRadius: 10, minWidth: 190,
                      boxShadow: '0 4px 20px rgba(52,96,111,0.15)',
                      zIndex: 99, overflow: 'hidden',
                    }}>
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid #f0f4f5', background: '#f8fbfc' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#4a7c8e' }}>{session.user?.name}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{session.user?.email}</div>
                      </div>
                      <DropdownItem href="/profilo" icon={<User size={14} />} label="Il mio profilo" onClick={() => setDropdownOpen(false)} />
                      <DropdownItem href="/annunci/miei" icon={<FileText size={14} />} label="I miei annunci" onClick={() => setDropdownOpen(false)} />
                      <DropdownItem href="/profilo/curriculum" icon={<FileText size={14} />} label="Curriculum sportivo" onClick={() => setDropdownOpen(false)} />
                      {isAdmin && <DropdownItem href="/admin" icon={<Shield size={14} />} label="Pannello admin" onClick={() => setDropdownOpen(false)} />}
                      {isAdmin && <DropdownItem href="/admin/pubblicita" icon={<Layout size={14} />} label="Gestione pubblicità" onClick={() => setDropdownOpen(false)} />}
                      <div style={{ borderTop: '1px solid #f0f4f5' }}>
                        <button
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'Barlow, sans-serif' }}
                          onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: '/' }) }}
                        >
                          <LogOut size={14} /> Esci
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/accedi" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', padding: '7px 16px', border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                Accedi
              </Link>
              <Link href="/registrazione" style={{ background: 'var(--ms-accent)', color: '#1a1200', textDecoration: 'none', padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                Registrati
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="visible-mobile"
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'none' }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: 'var(--ms-green-dark)', padding: '12px 20px', display: 'none' }} className="mobile-menu">
          <MobileNavItem href="/" label="Annunci" onClick={() => setMobileOpen(false)} />
          {session && <MobileNavItem href="/mappa" label="Mappa" onClick={() => setMobileOpen(false)} />}
          {session ? (
            <>
              <MobileNavItem href="/chat" label={`Chat${nonLetti > 0 ? ` (${nonLetti})` : ''}`} onClick={() => setMobileOpen(false)} />
              <MobileNavItem href="/profilo" label="Profilo" onClick={() => setMobileOpen(false)} />
              <MobileNavItem href="/profilo/curriculum" label="Curriculum" onClick={() => setMobileOpen(false)} />
              {isAdmin && <MobileNavItem href="/admin" label="Admin" onClick={() => setMobileOpen(false)} />}
              <button style={{ display: 'block', color: '#fca5a5', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0', fontSize: 15, fontWeight: 500, borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%', textAlign: 'left', fontFamily: 'Barlow, sans-serif' }}
                onClick={() => signOut({ callbackUrl: '/' })}>
                Esci
              </button>
            </>
          ) : (
            <>
              <MobileNavItem href="/accedi" label="Accedi" onClick={() => setMobileOpen(false)} />
              <MobileNavItem href="/registrazione" label="Registrati gratis" onClick={() => setMobileOpen(false)} accent />
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .visible-mobile { display: block !important; }
          .mobile-menu { display: block !important; }
        }
      `}</style>
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '6px 10px', borderRadius: 6, transition: 'background 0.12s' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      {children}
    </Link>
  )
}

function DropdownItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: '#374151', textDecoration: 'none', transition: 'background 0.1s' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#f0f7fa')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      <span style={{ color: 'var(--ms-green)' }}>{icon}</span> {label}
    </Link>
  )
}

function MobileNavItem({ href, label, onClick, accent }: { href: string; label: string; onClick: () => void; accent?: boolean }) {
  return (
    <Link href={href} onClick={onClick} style={{ display: 'block', color: accent ? 'var(--ms-accent)' : 'rgba(255,255,255,0.9)', textDecoration: 'none', padding: '10px 0', fontSize: 15, fontWeight: accent ? 700 : 500, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      {label}
    </Link>
  )
}

const iconBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 36, height: 36, borderRadius: 8,
  color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
  background: 'transparent', transition: 'background 0.12s',
}
