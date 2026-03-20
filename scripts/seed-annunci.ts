/**
 * Script di seeding annunci fittizi per popolare il sito
 * Esegui: npx tsx scripts/seed-annunci.ts
 */
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  const { Redis } = await import('@upstash/redis')
  const { v4: uuidv4 } = await import('uuid')

  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })

  // ── Coordinate comuni ────────────────────────────────────────────────────
  const COMUNI_PIEMONTE = [
    'Torino', 'Grugliasco', 'Collegno', 'Rivoli', 'Bruino', 'Nichelino',
    'Moncalieri', 'Settimo Torinese', 'Chieri', 'Pinerolo', 'Orbassano',
    'Carmagnola', 'Chivasso', 'Novara', 'Asti', 'Cuneo', 'Alessandria',
  ]
  const COMUNI_TOSCANA = [
    'Firenze', 'Prato', 'Livorno', 'Arezzo', 'Siena', 'Lucca',
    'Pistoia', 'Pisa', 'Grosseto', 'Massa',
  ]
  const COMUNI_CINTURA_TO = [
    'Collegno', 'Rivoli', 'Bruino', 'Grugliasco', 'Nichelino',
    'Orbassano', 'Piacenza d\'Adige', 'Moncalieri', 'Beinasco', 'Settimo Torinese',
  ]

  const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
  const randN = (n: number) => Math.floor(Math.random() * n)
  const randDate = (daysAgo: number) => {
    const d = new Date()
    d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo))
    return d.toISOString()
  }
  const futureDate = (daysFrom: number) => {
    const d = new Date()
    d.setDate(d.getDate() + Math.floor(Math.random() * daysFrom) + 7)
    return d.toISOString().split('T')[0]
  }

  // ── Dati per sport ───────────────────────────────────────────────────────
  const SPORT_DATA: Record<string, { ruoli: string[], categorie: string[] }> = {
    calcio: {
      ruoli: ['Portiere', 'Difensore centrale', 'Terzino dx', 'Terzino sx', 'Mediano', 'Mezzala', 'Trequartista', 'Ala dx', 'Ala sx', 'Centravanti', 'Seconda punta', 'Libero', 'Allenatore', 'Prep. atletico'],
      categorie: ['Under 12', 'Under 14', 'Under 16', 'Under 18', 'Under 21', 'Prima Squadra', 'Amatori', 'Master'],
    },
    calcio5: {
      ruoli: ['Portiere', 'Fixo', 'Ala dx', 'Ala sx', 'Pivot', 'Universale', 'Allenatore'],
      categorie: ['Under 12', 'Under 14', 'Under 17', 'Under 21', 'Prima Squadra', 'Amatori'],
    },
    pallavolo: {
      ruoli: ['Palleggiatore', 'Opposto', 'Schiacciatore', 'Centrale', 'Libero', 'Allenatore'],
      categorie: ['Under 13', 'Under 15', 'Under 17', 'Under 19', 'Prima Divisione', 'Serie D', 'Amatori'],
    },
    basket: {
      ruoli: ['Playmaker', 'Guardia', 'Ala piccola', 'Ala grande', 'Centro', 'Allenatore'],
      categorie: ['Under 13', 'Under 15', 'Under 17', 'Under 19', 'Prima Divisione', 'Serie D', 'Amatori'],
    },
    padel: {
      ruoli: ['Lato destro', 'Lato sinistro', 'Giocatore (entrambi i lati)', 'Istruttore / Coach'],
      categorie: ['Principiante', 'Intermedio', 'Avanzato', 'Amatori', 'Agonistico'],
    },
    softair: {
      ruoli: ['Caposquadra', 'Scout', 'Incursore / Assaltatore', 'Supporto / Mitragliere', 'Cecchino (Sniper)', 'Freeman'],
      categorie: ['Amatori', 'Agonistico', 'Simulazione tattica'],
    },
  }

  // ── Nomi fittizi ─────────────────────────────────────────────────────────
  const NOMI = ['Marco', 'Luca', 'Andrea', 'Matteo', 'Davide', 'Simone', 'Riccardo', 'Francesco', 'Alessandro', 'Fabio', 'Roberto', 'Gianluca', 'Stefano', 'Daniele', 'Paolo', 'Giorgio', 'Michele', 'Antonio', 'Lorenzo', 'Filippo']
  const COGNOMI = ['Rossi', 'Ferrari', 'Russo', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancini', 'Costa', 'Giordano', 'Rizzo', 'Lombardi', 'Barbieri']
  const SOC_NOMI = ['ASD', 'USD', 'Polisportiva', 'Circolo Sportivo', 'Club']
  const SOC_SUFFISSI = ['Atletico', 'United', 'Sporting', 'Virtus', 'Pro', 'Real', 'Olimpia', 'Stella', 'Alba', 'Aurora', 'Vigor', 'Fortis']

  const aliasUsati = new Set<string>()
  const makeAlias = (base: string) => {
    let alias = base.replace(/\s/g, '').slice(0, 12) + randN(999)
    while (aliasUsati.has(alias)) alias = base.replace(/\s/g, '').slice(0, 10) + randN(9999)
    aliasUsati.add(alias)
    return alias
  }

  // ── Descrizioni per tipo annuncio ────────────────────────────────────────
  const DESC_CERCA_SQUADRA = [
    'Giocatore esperto cerca squadra per la prossima stagione. Disponibile da subito.',
    'Cerco squadra in zona per riprendere a giocare dopo pausa. Motivato e affidabile.',
    'Giocatore con esperienza in categorie regionali cerca nuova avventura sportiva.',
    'Libero da impegni, cerco squadra con buon gruppo e voglia di migliorarsi.',
    'Esperienza pluriennale nel ruolo, cerco squadra ambiziosa per la stagione.',
  ]
  const DESC_DISPONIBILE = [
    'Disponibile per nuove opportunità. Ottima tecnica e spirito di squadra.',
    'Mi rendo disponibile per provini o accordi con squadre interessate.',
    'Attualmente svincolato, disponibile a valutare proposte di ogni categoria.',
    'Giocatore affidabile e puntuale cerca nuova destinazione per la prossima stagione.',
  ]
  const DESC_CERCA_ATLETI = [
    'La nostra società cerca rinforzi per completare la rosa della prima squadra.',
    'Ricerchiamo giocatori motivati per il settore giovanile. Struttura seria e organizzata.',
    'Società con ottima struttura cerca elementi per potenziare l\'organico.',
    'Siamo alla ricerca di giocatori di qualità per affrontare al meglio la stagione.',
  ]
  const DESC_TORNEO = [
    'Organizziamo torneo sportivo aperto a tutte le squadre della zona. Premi per i vincitori.',
    'Torneo primaverile con gironi e fase finale. Iscriviti entro la scadenza.',
    'Grande evento sportivo con partecipazione di squadre da tutta la regione.',
    'Torneo organizzato dalla nostra associazione. Quota iscrizione accessibile.',
  ]
  const DESC_AMICHEVOLE = [
    'Cerchiamo squadre per disputare amichevoli in preparazione alla stagione.',
    'Disponibili per amichevoli nel fine settimana. Campo regolamentare disponibile.',
    'Organizziamo amichevole per testare la rosa prima dell\'inizio del campionato.',
    'Siamo aperti a proposta di amichevoli con squadre della stessa categoria.',
  ]

  let totale = 0

  // ── Funzione crea annuncio ───────────────────────────────────────────────
  const creaAnnuncio = async (opts: {
    sport: string, tipo: string, comune: string, regione: string,
    ruoli: string[], categoria: string[], titolo: string, descrizione: string,
    chiuso?: boolean, isTorneo?: boolean, isAnnuncioSocieta?: boolean,
  }) => {
    const id = uuidv4()
    const nome = rand(NOMI)
    const cognome = rand(COGNOMI)
    const isSocieta = opts.isAnnuncioSocieta || opts.isTorneo || opts.tipo === 'cerca_atleti'

    const alias = isSocieta
      ? makeAlias(`${rand(SOC_NOMI)}${rand(SOC_SUFFISSI)}`)
      : makeAlias(`${nome}${cognome}`)

    const bumpedAt = randDate(180)
    const scadeAt = new Date(new Date(bumpedAt).setFullYear(new Date(bumpedAt).getFullYear() + 1)).toISOString()
    const chiusoAt = opts.chiuso ? randDate(90) : undefined
    const scadeAtChiuso = opts.chiuso ? new Date(new Date(chiusoAt!).setMonth(new Date(chiusoAt!).getMonth() + 3)).toISOString() : undefined

    const annuncio: any = {
      id,
      userId: `seed_${id}`, // userId fittizio — non presente nel pannello utenti
      alias,
      tipo: opts.tipo,
      sport: opts.sport,
      titolo: opts.titolo,
      descrizione: opts.descrizione,
      comune: opts.comune,
      regione: opts.regione,
      ruoli: opts.ruoli,
      categoria: opts.categoria,
      attivo: true,
      chiuso: opts.chiuso || false,
      chiusoAt: chiusoAt || null,
      scadeAt: opts.chiuso ? scadeAtChiuso : scadeAt,
      bumpedAt,
      updatedAt: bumpedAt,
      createdAt: bumpedAt,
      nomeSocieta: isSocieta ? alias : undefined,
      tipoUtente: isSocieta ? 'societa' : 'atleta',
    }

    if (opts.isTorneo) {
      const start = new Date()
      start.setDate(start.getDate() - randN(60) - 10)
      const end = new Date(start)
      end.setDate(end.getDate() + randN(3) + 1)
      annuncio.dataInizio = start.toISOString().split('T')[0]
      annuncio.dataFine = end.toISOString().split('T')[0]
      annuncio.nSquadreRicercate = [4, 6, 8, 10, 12, 16][randN(6)]
      annuncio.luogo = `Impianto Sportivo Comunale, ${opts.comune}`
    }

    const pipe = redis.pipeline()
    pipe.set(`annuncio:${id}`, JSON.stringify(annuncio))
    pipe.sadd(`ann:sport:${opts.sport}`, id)
    pipe.sadd(`ann:regione:${opts.regione.toLowerCase()}`, id)
    pipe.sadd(`ann:tipo:${opts.tipo}`, id)
    pipe.zadd('annunci:recenti:v2', { score: new Date(bumpedAt).getTime(), member: id })
    await pipe.exec()

    totale++
    return id
  }

  console.log('🌱 Avvio seeding annunci fittizi...\n')

  // ══════════════════════════════════════════════════════════════════════════
  // CALCIO — 30 annunci
  // ══════════════════════════════════════════════════════════════════════════
  for (let i = 0; i < 10; i++) {
    const comune = i < 5 ? rand(COMUNI_PIEMONTE) : rand(COMUNI_TOSCANA)
    const regione = i < 5 ? 'Piemonte' : 'Toscana'
    const ruolo = rand(SPORT_DATA.calcio.ruoli)
    const cat = rand(SPORT_DATA.calcio.categorie)
    await creaAnnuncio({ sport: 'calcio', tipo: 'ricerca_squadra', comune, regione, ruoli: [ruolo], categoria: [cat], titolo: `${ruolo} cerca squadra ${cat} - ${comune}`, descrizione: rand(DESC_CERCA_SQUADRA), chiuso: true })
  }
  for (let i = 0; i < 10; i++) {
    const comune = i < 5 ? rand(COMUNI_PIEMONTE) : rand(COMUNI_TOSCANA)
    const regione = i < 5 ? 'Piemonte' : 'Toscana'
    const ruoli = [rand(SPORT_DATA.calcio.ruoli), rand(SPORT_DATA.calcio.ruoli)].filter((v,i,a)=>a.indexOf(v)===i)
    const cat = rand(SPORT_DATA.calcio.categorie)
    await creaAnnuncio({ sport: 'calcio', tipo: 'cerca_atleti', comune, regione, ruoli, categoria: [cat], titolo: `Cerco ${ruoli[0]} per ${cat} - ${comune}`, descrizione: rand(DESC_CERCA_ATLETI), chiuso: true, isAnnuncioSocieta: true })
  }
  for (let i = 0; i < 10; i++) {
    const comune = i < 5 ? rand(COMUNI_PIEMONTE) : rand(COMUNI_TOSCANA)
    const regione = i < 5 ? 'Piemonte' : 'Toscana'
    const ruolo = rand(SPORT_DATA.calcio.ruoli)
    const cat = rand(SPORT_DATA.calcio.categorie)
    await creaAnnuncio({ sport: 'calcio', tipo: 'disponibilita', comune, regione, ruoli: [ruolo], categoria: [cat], titolo: `${ruolo} disponibile ${cat} - ${comune}`, descrizione: rand(DESC_DISPONIBILE), chiuso: true })
  }
  console.log('✅ Calcio: 30 annunci')

  // ══════════════════════════════════════════════════════════════════════════
  // CALCIO A 5 — 30 annunci
  // ══════════════════════════════════════════════════════════════════════════
  for (let i = 0; i < 10; i++) {
    const comune = i < 5 ? rand(COMUNI_PIEMONTE) : rand(COMUNI_TOSCANA)
    const regione = i < 5 ? 'Piemonte' : 'Toscana'
    const ruolo = rand(SPORT_DATA.calcio5.ruoli)
    const cat = rand(SPORT_DATA.calcio5.categorie)
    await creaAnnuncio({ sport: 'calcio5', tipo: 'ricerca_squadra', comune, regione, ruoli: [ruolo], categoria: [cat], titolo: `${ruolo} calcio a 5 cerca squadra - ${comune}`, descrizione: rand(DESC_CERCA_SQUADRA), chiuso: true })
  }
  for (let i = 0; i < 10; i++) {
    const comune = i < 5 ? rand(COMUNI_PIEMONTE) : rand(COMUNI_TOSCANA)
    const regione = i < 5 ? 'Piemonte' : 'Toscana'
    const ruoli = [rand(SPORT_DATA.calcio5.ruoli)]
    const cat = rand(SPORT_DATA.calcio5.categorie)
    await creaAnnuncio({ sport: 'calcio5', tipo: 'cerca_atleti', comune, regione, ruoli, categoria: [cat], titolo: `Squadra calcio a 5 cerca ${ruoli[0]} - ${comune}`, descrizione: rand(DESC_CERCA_ATLETI), chiuso: true, isAnnuncioSocieta: true })
  }
  for (let i = 0; i < 10; i++) {
    const comune = i < 5 ? rand(COMUNI_PIEMONTE) : rand(COMUNI_TOSCANA)
    const regione = i < 5 ? 'Piemonte' : 'Toscana'
    const cat = rand(SPORT_DATA.calcio5.categorie)
    await creaAnnuncio({ sport: 'calcio5', tipo: 'amichevole', comune, regione, ruoli: [], categoria: [cat], titolo: `Amichevole calcio a 5 ${cat} - ${comune}`, descrizione: rand(DESC_AMICHEVOLE), chiuso: true, isAnnuncioSocieta: true, isTorneo: false })
  }
  console.log('✅ Calcio a 5: 30 annunci')

  // ══════════════════════════════════════════════════════════════════════════
  // PALLAVOLO — 30 annunci
  // ══════════════════════════════════════════════════════════════════════════
  for (let i = 0; i < 10; i++) {
    const comune = i < 5 ? rand(COMUNI_PIEMONTE) : rand(COMUNI_TOSCANA)
    const regione = i < 5 ? 'Piemonte' : 'Toscana'
    const ruolo = rand(SPORT_DATA.pallavolo.ruoli)
    const cat = rand(SPORT_DATA.pallavolo.categorie)
    await creaAnnuncio({ sport: 'pallavolo', tipo: 'ricerca_squadra', comune, regione, ruoli: [ruolo], categoria: [cat], titolo: `${ruolo} pallavolo cerca squadra - ${comune}`, descrizione: rand(DESC_CERCA_SQUADRA), chiuso: true })
  }
  for (let i = 0; i < 10; i++) {
    const comune = i < 5 ? rand(COMUNI_PIEMONTE) : rand(COMUNI_TOSCANA)
    const regione = i < 5 ? 'Piemonte' : 'Toscana'
    const ruoli = [rand(SPORT_DATA.pallavolo.ruoli)]
    const cat = rand(SPORT_DATA.pallavolo.categorie)
    await creaAnnuncio({ sport: 'pallavolo', tipo: 'cerca_atleti', comune, regione, ruoli, categoria: [cat], titolo: `ASD pallavolo cerca ${ruoli[0]} - ${comune}`, descrizione: rand(DESC_CERCA_ATLETI), chiuso: true, isAnnuncioSocieta: true })
  }
  for (let i = 0; i < 10; i++) {
    const comune = i < 5 ? rand(COMUNI_PIEMONTE) : rand(COMUNI_TOSCANA)
    const regione = i < 5 ? 'Piemonte' : 'Toscana'
    const cat = rand(SPORT_DATA.pallavolo.categorie)
    await creaAnnuncio({ sport: 'pallavolo', tipo: 'torneo', comune, regione, ruoli: [], categoria: [cat], titolo: `Torneo pallavolo ${cat} - ${comune}`, descrizione: rand(DESC_TORNEO), chiuso: true, isAnnuncioSocieta: true, isTorneo: true })
  }
  console.log('✅ Pallavolo: 30 annunci')

  // ══════════════════════════════════════════════════════════════════════════
  // BASKET — 30 annunci
  // ══════════════════════════════════════════════════════════════════════════
  for (let i = 0; i < 10; i++) {
    const comune = i < 5 ? rand(COMUNI_PIEMONTE) : rand(COMUNI_TOSCANA)
    const regione = i < 5 ? 'Piemonte' : 'Toscana'
    const ruolo = rand(SPORT_DATA.basket.ruoli)
    const cat = rand(SPORT_DATA.basket.categorie)
    await creaAnnuncio({ sport: 'basket', tipo: 'ricerca_squadra', comune, regione, ruoli: [ruolo], categoria: [cat], titolo: `${ruolo} basket cerca squadra - ${comune}`, descrizione: rand(DESC_CERCA_SQUADRA), chiuso: true })
  }
  for (let i = 0; i < 10; i++) {
    const comune = i < 5 ? rand(COMUNI_PIEMONTE) : rand(COMUNI_TOSCANA)
    const regione = i < 5 ? 'Piemonte' : 'Toscana'
    const ruoli = [rand(SPORT_DATA.basket.ruoli)]
    const cat = rand(SPORT_DATA.basket.categorie)
    await creaAnnuncio({ sport: 'basket', tipo: 'cerca_atleti', comune, regione, ruoli, categoria: [cat], titolo: `Società basket cerca ${ruoli[0]} - ${comune}`, descrizione: rand(DESC_CERCA_ATLETI), chiuso: true, isAnnuncioSocieta: true })
  }
  for (let i = 0; i < 10; i++) {
    const comune = i < 5 ? rand(COMUNI_PIEMONTE) : rand(COMUNI_TOSCANA)
    const regione = i < 5 ? 'Piemonte' : 'Toscana'
    const cat = rand(SPORT_DATA.basket.categorie)
    await creaAnnuncio({ sport: 'basket', tipo: 'torneo', comune, regione, ruoli: [], categoria: [cat], titolo: `Torneo basket ${cat} - ${comune}`, descrizione: rand(DESC_TORNEO), chiuso: true, isAnnuncioSocieta: true, isTorneo: true })
  }
  console.log('✅ Basket: 30 annunci')

  // ══════════════════════════════════════════════════════════════════════════
  // PADEL — 30 annunci
  // ══════════════════════════════════════════════════════════════════════════
  for (let i = 0; i < 10; i++) {
    const comune = i < 5 ? rand(COMUNI_PIEMONTE) : rand(COMUNI_TOSCANA)
    const regione = i < 5 ? 'Piemonte' : 'Toscana'
    const ruolo = rand(SPORT_DATA.padel.ruoli)
    const cat = rand(SPORT_DATA.padel.categorie)
    await creaAnnuncio({ sport: 'padel', tipo: 'ricerca_squadra', comune, regione, ruoli: [ruolo], categoria: [cat], titolo: `${ruolo} padel cerca partner - ${comune}`, descrizione: rand(DESC_CERCA_SQUADRA), chiuso: true })
  }
  for (let i = 0; i < 10; i++) {
    const comune = i < 5 ? rand(COMUNI_PIEMONTE) : rand(COMUNI_TOSCANA)
    const regione = i < 5 ? 'Piemonte' : 'Toscana'
    const cat = rand(SPORT_DATA.padel.categorie)
    await creaAnnuncio({ sport: 'padel', tipo: 'torneo', comune, regione, ruoli: [], categoria: [cat], titolo: `Torneo padel ${cat} - ${comune}`, descrizione: rand(DESC_TORNEO), chiuso: true, isAnnuncioSocieta: true, isTorneo: true })
  }
  for (let i = 0; i < 10; i++) {
    const comune = i < 5 ? rand(COMUNI_PIEMONTE) : rand(COMUNI_TOSCANA)
    const regione = i < 5 ? 'Piemonte' : 'Toscana'
    const cat = rand(SPORT_DATA.padel.categorie)
    await creaAnnuncio({ sport: 'padel', tipo: 'amichevole', comune, regione, ruoli: [], categoria: [cat], titolo: `Amichevole padel ${cat} - ${comune}`, descrizione: rand(DESC_AMICHEVOLE), chiuso: true, isAnnuncioSocieta: true })
  }
  console.log('✅ Padel: 30 annunci')

  // ══════════════════════════════════════════════════════════════════════════
  // SOFTAIR — 3 annunci
  // ══════════════════════════════════════════════════════════════════════════
  for (let i = 0; i < 3; i++) {
    const comune = rand(COMUNI_PIEMONTE)
    const ruolo = rand(SPORT_DATA.softair.ruoli)
    await creaAnnuncio({ sport: 'softair', tipo: 'ricerca_squadra', comune, regione: 'Piemonte', ruoli: [ruolo], categoria: ['Amatori'], titolo: `${ruolo} softair cerca team - ${comune}`, descrizione: 'Operatore softair con esperienza cerca team organizzato per eventi e tornei.', chiuso: true })
  }
  console.log('✅ Softair: 3 annunci')

  // ══════════════════════════════════════════════════════════════════════════
  // CINTURA TORINO — 30 annunci extra
  // ══════════════════════════════════════════════════════════════════════════
  const SPORT_LIST = ['calcio', 'calcio5', 'pallavolo', 'basket', 'padel']
  for (let i = 0; i < 30; i++) {
    const comune = rand(COMUNI_CINTURA_TO)
    const sport = rand(SPORT_LIST)
    const tipi = ['ricerca_squadra', 'cerca_atleti', 'disponibilita', 'amichevole', 'torneo']
    const tipo = rand(tipi)
    const isSoc = ['cerca_atleti', 'amichevole', 'torneo'].includes(tipo)
    const isTorn = tipo === 'torneo'
    const data = SPORT_DATA[sport]
    const ruoli = isSoc ? [rand(data.ruoli)] : [rand(data.ruoli)]
    const cat = [rand(data.categorie)]
    const descs = tipo === 'ricerca_squadra' ? DESC_CERCA_SQUADRA : tipo === 'cerca_atleti' ? DESC_CERCA_ATLETI : tipo === 'disponibilita' ? DESC_DISPONIBILE : tipo === 'torneo' ? DESC_TORNEO : DESC_AMICHEVOLE
    const titoloMap: Record<string,string> = {
      ricerca_squadra: `${ruoli[0]} cerca squadra ${sport} - ${comune}`,
      cerca_atleti: `Cerco ${ruoli[0]} per ${cat[0]} - ${comune}`,
      disponibilita: `${ruoli[0]} disponibile - ${comune}`,
      amichevole: `Amichevole ${sport} ${cat[0]} - ${comune}`,
      torneo: `Torneo ${sport} ${cat[0]} - ${comune}`,
    }
    await creaAnnuncio({ sport, tipo, comune, regione: 'Piemonte', ruoli, categoria: cat, titolo: titoloMap[tipo], descrizione: rand(descs), chiuso: true, isAnnuncioSocieta: isSoc, isTorneo: isTorn })
  }
  console.log('✅ Cintura Torino: 30 annunci extra')

  // ══════════════════════════════════════════════════════════════════════════
  // TORNEI STORICI CHIUSI — 10 extra
  // ══════════════════════════════════════════════════════════════════════════
  const SPORT_TORNEI = ['calcio', 'calcio5', 'pallavolo', 'basket', 'padel']
  for (let i = 0; i < 10; i++) {
    const sport = rand(SPORT_TORNEI)
    const comune = i < 5 ? rand(COMUNI_PIEMONTE) : rand(COMUNI_TOSCANA)
    const regione = i < 5 ? 'Piemonte' : 'Toscana'
    const cat = [rand(SPORT_DATA[sport].categorie)]
    await creaAnnuncio({ sport, tipo: 'torneo', comune, regione, ruoli: [], categoria: cat, titolo: `Torneo ${sport} ${cat[0]} ${2024 + randN(2)} - ${comune}`, descrizione: rand(DESC_TORNEO), chiuso: true, isAnnuncioSocieta: true, isTorneo: true })
  }
  console.log('✅ Tornei storici chiusi: 10')

  console.log(`\n🎉 Seeding completato! Totale annunci creati: ${totale}`)
}

main().catch(console.error)
