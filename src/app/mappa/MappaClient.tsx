'use client'
import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Search, SlidersHorizontal, X, MapPin, Users, MessageCircle } from 'lucide-react'
import { SPORT_LABELS, RUOLI_PER_SPORT, CATEGORIE } from '@/types'
import type { Sport } from '@/types'
import ChatModal from '@/components/chat/ChatModal'
import type { ProfiloPubblico } from '@/types'

// Leaflet caricato solo lato client
const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false, loading: () => (
  <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f7fa' }}>
    <div style={{ textAlign:'center', color:'#4a7c8e' }}>
      <MapPin size={32} style={{ margin:'0 auto 8px', display:'block', opacity: 0.5 }}/>
      <p style={{ fontSize:14 }}>Caricamento mappa...</p>
    </div>
  </div>
) })

interface GruppoComune {
  comune: string; lat: number; lon: number; count: number; distanza: number
  profili: Array<{ id:string; alias:string; annoDiNascita:number; ruoli:string[]; sport:string[]; statoAnnuncio:string; descrizione?:string }>
}

interface Props {
  userId: string
  comuneUtente: string
  regioneUtente: string
}

const COORDINATE_COMUNI: Record<string, [number, number]> = {
  'torino': [45.0703, 7.6869], 'grugliasco': [45.0628, 7.5783], 'moncalieri': [44.9983, 7.6822],
  'collegno': [45.0786, 7.5632], 'rivoli': [45.0712, 7.5122], 'nichelino': [44.9956, 7.6439],
  'settimo torinese': [45.1378, 7.7636], 'chieri': [44.9958, 7.8231],
  'milano': [45.4642, 9.1900], 'roma': [41.9028, 12.4964], 'napoli': [40.8518, 14.2681],
  'bologna': [44.4949, 11.3426], 'firenze': [43.7696, 11.2558], 'venezia': [45.4408, 12.3155],
  'genova': [44.4056, 8.9463], 'bergamo': [45.6983, 9.6773], 'verona': [45.4384, 10.9916],
  'padova': [45.4064, 11.8768], 'brescia': [45.5416, 10.2118], 'modena': [44.6471, 10.9252],
  'parma': [44.8015, 10.3279], 'novara': [45.4468, 8.6220], 'asti': [44.9004, 8.2065],
  'cuneo': [44.3865, 7.5422], 'biella': [45.5659, 8.0531], 'vercelli': [45.3274, 8.4249],
  'pinerolo': [44.8882, 7.3530], 'chivasso': [45.1902, 7.8879], 'ivrea': [45.4657, 7.8748],
  'orbassano': [44.9928, 7.5354], 'carmagnola': [44.8500, 7.7167],
}

export default function MappaClient({ userId, comuneUtente, regioneUtente }: Props) {
  const [gruppi, setGruppi] = useState<GruppoComune[]>([])
  const [loading, setLoading] = useState(true)
  const [filtri, setFiltri] = useState({ sport: '', ruolo: '', categoria: '', raggio: '50' })
  const [centro, setCentro] = useState<[number, number] | null>(null)
  const [gruppoSelezionato, setGruppoSelezionato] = useState<GruppoComune | null>(null)
  const [chatTarget, setChatTarget] = useState<ProfiloPubblico | null>(null)
  const [addressInput, setAddressInput] = useState(comuneUtente)

  // Imposta centro iniziale dal comune dell'utente
  useEffect(() => {
    const coords = COORDINATE_COMUNI[comuneUtente.toLowerCase()]
    if (coords) setCentro(coords)
    else setCentro([45.0703, 7.6869]) // fallback Torino
  }, [comuneUtente])

  const caricaDati = useCallback(async () => {
    if (!centro) return
    setLoading(true)
    const params = new URLSearchParams({
      lat: String(centro[0]),
      lon: String(centro[1]),
      raggio: filtri.raggio,
      ...(filtri.sport && { sport: filtri.sport }),
      ...(filtri.ruolo && { ruolo: filtri.ruolo }),
      ...(filtri.categoria && { categoria: filtri.categoria }),
    })
    const res = await fetch(`/api/mappa?${params}`)
    const data = await res.json()
    if (data.success) setGruppi(data.data)
    setLoading(false)
  }, [centro, filtri])

  useEffect(() => { caricaDati() }, [caricaDati])

  const cercaIndirizzo = () => {
    const coords = COORDINATE_COMUNI[addressInput.toLowerCase().trim()]
    if (coords) {
      setCentro(coords)
    } else {
      alert(`Comune "${addressInput}" non trovato nel database. Prova con: Torino, Milano, Roma...`)
    }
  }

  const totaleUtenti = gruppi.reduce((s, g) => s + g.count, 0)

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Barra controlli */}
      <div style={{ background: '#fff', borderBottom: '1px solid #d0dde2', padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', zIndex: 10 }}>

        {/* Ricerca indirizzo/comune */}
        <div style={{ display: 'flex', gap: 4, flex: '0 0 auto' }}>
          <div style={{ position: 'relative' }}>
            <MapPin size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }} />
            <input
              className="ms-input"
              style={{ paddingLeft: 28, width: 180, height: 36, fontSize: 13 }}
              value={addressInput}
              onChange={e => setAddressInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && cercaIndirizzo()}
              placeholder="Comune di ricerca..."
            />
          </div>
          <button className="btn-primary" style={{ padding: '6px 12px', height: 36, fontSize: 13 }} onClick={cercaIndirizzo}>
            <Search size={14} />
          </button>
        </div>

        <div style={{ width: 1, height: 28, background: '#d0dde2' }} />

        {/* Raggio */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>Raggio:</span>
          <select className="ms-select" style={{ width: 80, height: 36, fontSize: 13, padding: '0 8px' }}
            value={filtri.raggio} onChange={e => setFiltri(f => ({ ...f, raggio: e.target.value }))}>
            <option value="10">10 km</option>
            <option value="25">25 km</option>
            <option value="50">50 km</option>
            <option value="100">100 km</option>
            <option value="500">Tutta Italia</option>
          </select>
        </div>

        {/* Sport */}
        <select className="ms-select" style={{ width: 130, height: 36, fontSize: 13, padding: '0 8px' }}
          value={filtri.sport} onChange={e => setFiltri(f => ({ ...f, sport: e.target.value, ruolo: '' }))}>
          <option value="">Tutti gli sport</option>
          {Object.entries(SPORT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>

        {/* Ruolo */}
        {filtri.sport && (
          <select className="ms-select" style={{ width: 150, height: 36, fontSize: 13, padding: '0 8px' }}
            value={filtri.ruolo} onChange={e => setFiltri(f => ({ ...f, ruolo: e.target.value }))}>
            <option value="">Tutti i ruoli</option>
            {RUOLI_PER_SPORT[filtri.sport as Sport].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        )}

        {/* Categoria */}
        <select className="ms-select" style={{ width: 140, height: 36, fontSize: 13, padding: '0 8px' }}
          value={filtri.categoria} onChange={e => setFiltri(f => ({ ...f, categoria: e.target.value }))}>
          <option value="">Tutte le categorie</option>
          {CATEGORIE.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Statistiche */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          {loading ? (
            <span style={{ fontSize: 13, color: '#9ca3af' }}>Caricamento...</span>
          ) : (
            <span style={{ fontSize: 13, color: '#4a7c8e', fontWeight: 600 }}>
              <Users size={14} style={{ display:'inline', marginRight:4, verticalAlign:'middle' }} />
              {totaleUtenti} utenti in {gruppi.length} comuni
            </span>
          )}
        </div>
      </div>

      {/* Contenuto principale: mappa + pannello laterale */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Mappa */}
        <div style={{ flex: 1, position: 'relative' }}>
          {centro && (
            <MapComponent
              centro={centro}
              gruppi={gruppi}
              onGruppoClick={setGruppoSelezionato}
              gruppoSelezionato={gruppoSelezionato}
            />
          )}
        </div>

        {/* Pannello laterale utenti */}
        {gruppoSelezionato && (
          <div style={{
            width: 320, background: '#fff',
            borderLeft: '1px solid #d0dde2',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', zIndex: 5,
          }}>
            {/* Header pannello */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f4f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fbfc' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1e2e34', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={15} style={{ color: 'var(--ms-green)' }} />
                  {gruppoSelezionato.comune}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {gruppoSelezionato.count} {gruppoSelezionato.count === 1 ? 'utente' : 'utenti'}
                  {gruppoSelezionato.distanza > 0 && ` · ${Math.round(gruppoSelezionato.distanza)} km da ${addressInput}`}
                </div>
              </div>
              <button onClick={() => setGruppoSelezionato(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            {/* Lista utenti */}
            <div style={{ overflowY: 'auto', flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {gruppoSelezionato.profili.map(p => (
                <div key={p.id} style={{
                  background: '#fff', border: '1px solid #d0dde2',
                  borderRadius: 10, padding: '12px 14px',
                  transition: 'box-shadow 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--ms-green-light)', color: 'var(--ms-green)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                    }}>
                      {p.alias[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.alias}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>
                        {p.annoDiNascita > 1900 ? `Anno ${p.annoDiNascita}` : ''}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                      background: p.statoAnnuncio === 'disponibile' ? '#d8eff0' : '#ddeaf0',
                      color: p.statoAnnuncio === 'disponibile' ? '#2a6e78' : '#2a5a78',
                    }}>
                      {p.statoAnnuncio === 'disponibile' ? '● Disponibile' : '● Cerca'}
                    </span>
                  </div>

                  {/* Sport e ruoli */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: p.descrizione ? 8 : 10 }}>
                    {p.sport.slice(0,2).map(s => (
                      <span key={s} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, textTransform: 'uppercase', background: '#e8f3f6', color: '#4a7c8e' }}>
                        {SPORT_LABELS[s as Sport] || s}
                      </span>
                    ))}
                    {p.ruoli.slice(0,2).map(r => (
                      <span key={r} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: '#f0f4f5', color: '#4a6470', border: '1px solid #d0dde2' }}>
                        {r}
                      </span>
                    ))}
                  </div>

                  {/* Descrizione */}
                  {p.descrizione && (
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 10px', lineHeight: 1.4, fontStyle: 'italic' }}>
                      "{p.descrizione}"
                    </p>
                  )}

                  {/* Azione chat */}
                  <button
                    onClick={() => setChatTarget({
                      id: p.id, alias: p.alias, annoDiNascita: p.annoDiNascita,
                      tipo: 'atleta', comune: gruppoSelezionato.comune, regione: '',
                      sport: p.sport as any, sportPrimario: p.sport[0] as any,
                      ruoli: p.ruoli, categoria: [], statoAnnuncio: p.statoAnnuncio as any,
                      nascondiRuolo: false, createdAt: '',
                    })}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '7px', border: '1px solid var(--ms-green)', borderRadius: 8,
                      background: 'transparent', color: 'var(--ms-green)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'Barlow, sans-serif', transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--ms-green-light)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <MessageCircle size={14} /> Avvia chat
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat modal */}
      {chatTarget && <ChatModal destinatario={chatTarget} onClose={() => setChatTarget(null)} />}
    </div>
  )
}
