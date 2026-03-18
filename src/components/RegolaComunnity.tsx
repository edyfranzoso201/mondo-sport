export default function RegoleCommunity() {
  return (
    <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.7 }}>
      <p style={{ fontWeight: 700, fontSize: 13, color: '#1e2e34', margin: '0 0 10px' }}>
        📋 Regole della Community Mondo Sport
      </p>

      <p style={{ margin: '0 0 8px', color: '#6b7280', fontSize: 11 }}>
        Registrandoti accetti di rispettare le seguenti regole. La violazione può comportare la sospensione o l'eliminazione dell'account.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

        <Regola n="1" titolo="Solo sport presenti nell'app">
          Gli annunci devono riguardare esclusivamente i sport disponibili: Calcio, Calcio a 5, Pallavolo, Basket e Padel. Non sono ammessi annunci di altri sport o attività non sportive.
        </Regola>

        <Regola n="2" titolo="Solo primo contatto tra utenti">
          La chat è uno strumento di <strong>primo contatto</strong> tra atleti e società. Non è consentito usarla per scopi commerciali, vendita di prodotti, promozione di servizi esterni o qualsiasi attività non legata alla ricerca sportiva.
        </Regola>

        <Regola n="3" titolo="Educazione e rispetto">
          È obbligatorio mantenere un linguaggio rispettoso e professionale in ogni comunicazione. Sono vietati insulti, minacce, linguaggio offensivo, discriminatorio o sessista.
        </Regola>

        <Regola n="4" titolo="Veridicità delle informazioni">
          Le informazioni inserite nel profilo e negli annunci devono essere veritiere. È vietato impersonare altri utenti, creare account falsi o fornire dati personali non reali.
        </Regola>

        <Regola n="5" titolo="No spam e pubblicità">
          È vietato inviare messaggi ripetitivi, spam, link pubblicitari o qualsiasi contenuto promozionale non autorizzato dalla piattaforma.
        </Regola>

        <Regola n="6" titolo="No contenuti inappropriati">
          È vietato pubblicare contenuti offensivi, violenti, sessualmente espliciti o che violino la dignità delle persone.
        </Regola>

        <Regola n="7" titolo="Privacy degli altri utenti">
          È vietato condividere informazioni personali di altri utenti (numeri di telefono, indirizzi, foto) senza il loro esplicito consenso.
        </Regola>

        <Regola n="8" titolo="Segnalazione abusi">
          Ogni utente ha il diritto e la responsabilità di segnalare comportamenti scorretti scrivendo a{' '}
          <a href="mailto:info.mondo2026@gmail.com" style={{ color: 'var(--ms-green)' }}>
            info.mondo2026@gmail.com
          </a>
          . Gli amministratori si riservano il diritto di intervenire in qualsiasi momento.
        </Regola>

      </div>

      <p style={{ margin: '10px 0 0', fontSize: 10, color: '#9ca3af' }}>
        Mondo Sport si riserva il diritto di modificare queste regole. Gli utenti saranno informati di eventuali cambiamenti.
      </p>
    </div>
  )
}

function Regola({ n, titolo, children }: { n: string; titolo: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '8px 10px', background: '#f8fbfc', borderRadius: 8, border: '1px solid #e8f0f4' }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', background: 'var(--ms-green)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 1,
      }}>
        {n}
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1e2e34', marginBottom: 2 }}>{titolo}</div>
        <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{children}</div>
      </div>
    </div>
  )
}
