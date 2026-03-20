// ─── Sport & Ruoli ────────────────────────────────────────────────────────────

export type Sport = 'calcio' | 'calcio5' | 'pallavolo' | 'basket' | 'padel' | 'softair'

export const SPORT_LABELS: Record<Sport, string> = {
  calcio: 'Calcio',
  calcio5: 'Calcio a 5',
  pallavolo: 'Pallavolo',
  basket: 'Basket',
  padel: 'Padel',
  softair: 'Softair',
}

export const SPORT_ICONS: Record<Sport, string> = {
  calcio: '⚽',
  calcio5: '🥅',
  pallavolo: '🏐',
  basket: '🏀',
  padel: '🎾',
  softair: '🎯',
}

export const RUOLI_PER_SPORT: Record<Sport, string[]> = {
  calcio: [
    'Portiere', 'Terzino destro', 'Terzino sinistro', 'Difensore centrale',
    'Libero', 'Mediano', 'Mezzala', 'Trequartista', 'Ala destra', 'Ala sinistra',
    'Seconda punta', 'Centravanti', 'Allenatore', 'Allenatore in seconda',
    'Preparatore dei portieri', 'Preparatore atletico', 'Team manager', 'Dirigente',
  ],
  calcio5: [
    'Portiere', 'Fixo (difensore)', 'Ala destra', 'Ala sinistra',
    'Pivot (attaccante centrale)', 'Universale', 'Portiere volante',
    'Allenatore', 'Allenatore in seconda', 'Preparatore atletico',
    'Team manager', 'Dirigente',
  ],
  pallavolo: [
    'Palleggiatore', 'Opposto', 'Schiacciatrice/Schiacciatore',
    'Centrale', 'Libero', 'Allenatore', 'Allenatore in seconda',
    'Preparatore atletico', 'Team manager', 'Dirigente',
  ],
  basket: [
    'Playmaker', 'Play-guardia', 'Guardia', 'Guardia-ala', 'Ala piccola',
    'Ala grande', 'Centro', 'Allenatore', 'Allenatore in seconda',
    'Preparatore atletico', 'Team manager', 'Dirigente',
  ],
  padel: [
    'Lato destro', 'Lato sinistro', 'Giocatore (entrambi i lati)',
    'Istruttore / Coach', 'Allenatore', 'Team manager',
  ],
  softair: [
    'Caposquadra', 'Scout', 'Incursore / Assaltatore', 'Supporto / Mitragliere',
    'Cecchino (Sniper)', 'Spotter', 'Navigatore / Cartografo',
    'Medico da campo', 'Geniere', 'Retroguardia', 'Freeman',
    'Istruttore tattico', 'Team manager', 'Dirigente',
  ],
}

export const CATEGORIE = [
  'Under 8', 'Under 10', 'Under 12', 'Under 14', 'Under 16', 'Under 18',
  'Under 20', 'Under 23', 'Senior', 'Master',
]

export const REGIONI_ITALIA = [
  'Lombardia', 'Piemonte', 'Toscana',
  // Altre regioni in arrivo...
]

export const REGIONI_ITALIA_SELECT = [
  ...REGIONI_ITALIA,
  '— Presto anche la Tua regione, chiedi info —',
]

// ─── Utente ───────────────────────────────────────────────────────────────────

export type TipoUtente = 'atleta' | 'societa' | 'staff' | 'admin'
export type StatoUtente = 'pending' | 'approved' | 'rejected' | 'suspended'
export type StatoAnnuncio = 'disponibile' | 'cerca' | 'nascosto'

export interface UtenteBase {
  id: string
  tipo: TipoUtente
  stato: StatoUtente
  alias: string
  email: string
  passwordHash: string
  createdAt: string
  updatedAt: string
  // Dati visibili
  annoDiNascita: number
  comune: string
  regione: string
  sport: Sport[]
  sportPrimario: Sport
  ruoli: string[]
  categoria: string[]
  statoAnnuncio: StatoAnnuncio
  nascondiRuolo: boolean
  descrizione?: string
  notificheEmailChat: boolean  // ricevi email per nuovi messaggi
  mostraAliasInChat: boolean // true = alias, false = nome reale in chat
  // Dati privati (solo admin)
  nome: string
  cognome: string
  dataNascita: string
  codiceFiscale: string
  telefono: string
  emailVerificato: boolean
  telefonoVerificato: boolean
  // Alert
  alertAttivi: AlertConfig[]
}

export interface UtenteAtleta extends UtenteBase {
  tipo: 'atleta'
  minorenne: boolean
  // Se minorenne: dati genitore
  genitore?: {
    nome: string
    cognome: string
    dataNascita: string
    codiceFiscale: string
    email: string
    telefono: string
  }
}

export interface UtenteSocieta extends UtenteBase {
  tipo: 'societa'
  nomeSocieta: string
  ruoloSocietario: string // Presidente, DS, Segretario...
  mostraNomeSocieta: boolean
}

export interface UtenteStaff extends UtenteBase {
  tipo: 'staff'
  qualifiche: string[]
  liberoProf: boolean
}

export type Utente = UtenteAtleta | UtenteSocieta | UtenteStaff | UtenteBase

// ─── Profilo pubblico (visibile a tutti) ─────────────────────────────────────

export interface ProfiloPubblico {
  id: string
  tipo: TipoUtente
  alias: string
  annoDiNascita: number
  comune: string
  regione: string
  sport: Sport[]
  sportPrimario: Sport
  ruoli: string[]
  categoria: string[]
  statoAnnuncio: StatoAnnuncio
  nascondiRuolo?: boolean
  descrizione?: string
  createdAt: string
  // Solo per società
  nomeSocieta?: string
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface Messaggio {
  id: string
  conversazioneId: string
  mittente: string // userId
  testo: string
  timestamp: string
  letto: boolean
}

export interface Conversazione {
  id: string
  partecipanti: string[] // [userId1, userId2]
  ultimoMessaggio?: string
  ultimaAttivita: string
  nonLetti: Record<string, number>
}

// ─── Alert ────────────────────────────────────────────────────────────────────

export interface AlertConfig {
  id: string
  userId: string
  sport?: Sport
  ruolo?: string
  regione?: string
  comune?: string
  categoria?: string
  raggio?: number // km
  createdAt: string
  attivo: boolean
}

// ─── Filtri ricerca ───────────────────────────────────────────────────────────

export interface FiltriRicerca {
  sport?: Sport
  ruolo?: string
  regione?: string
  comune?: string
  categoria?: string
  tipo?: TipoUtente
  statoAnnuncio?: StatoAnnuncio
  page?: number
  limit?: number
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

// ─── Curriculum sportivo ──────────────────────────────────────────────────────

export interface EsperienzaSportiva {
  id: string
  societa: string
  ruolo: string
  sport: Sport
  dal: string       // anno inizio
  al?: string       // anno fine (vuoto = in corso)
  categoria: string
  note?: string
}

export interface CurriculumSportivo {
  userId: string
  esperienze: EsperienzaSportiva[]
  titoli: string[]        // es. "Campione regionale 2022"
  qualifiche: string[]    // es. "Patente UEFA B"
  altezza?: number        // cm
  peso?: number           // kg
  piedePredominante?: 'destro' | 'sinistro' | 'ambidestro'
  note?: string
  visibile: boolean       // false = nascosto (feature futura a pagamento)
  updatedAt: string
}

// ─── Pubblicità ───────────────────────────────────────────────────────────────

export type TipoSlotAd = 'esterno' | 'interno' | 'vuoto'

export interface SlotAd {
  id: string          // es. "left-1", "right-1", "left-2", "right-2"
  tipo: TipoSlotAd
  titolo?: string     // testo sul banner
  sottotitolo?: string
  coloresfondo?: string
  coloretesto?: string
  // Link esterno
  urlEsterno?: string
  apriNuovaTab?: boolean
  // Pagina interna
  paginaInterna?: string  // es. "/registrazione", "/mappa"
  // Immagine (URL)
  immagineUrl?: string
  attivo: boolean
  updatedAt: string
}

// ─── Annunci multipli ─────────────────────────────────────────────────────────

export type TipoAnnuncio = 'ricerca_squadra' | 'disponibilita' | 'cerca_atleti' | 'torneo' | 'amichevole' | 'cerca_torneo' | 'cerca_amichevole'
export type LivelloGioco = 'basso' | 'medio' | 'alto'

export interface Annuncio {
  id: string
  userId: string
  tipo: TipoAnnuncio
  titolo: string
  descrizione: string
  sport: Sport
  ruoli: string[]
  categoria: string[]
  comune: string
  regione: string
  kmRaggio?: number        // solo per cerca_torneo / cerca_amichevole
  // Solo per torneo/amichevole
  nSquadreRicercate?: number   // quante squadre cercano
  dataInizio?: string          // YYYY-MM-DD
  dataFine?: string
  luogo?: string               // sede evento
  // Metadati
  attivo: boolean
  piede?: 'destro' | 'sinistro' | 'entrambi'  // solo per sport con piede
  altezza?: number       // cm
  chiuso?: boolean      // visibile ma non contattabile via chat
  chiusoAt?: string     // data in cui è stato messo "non disponibile"
  scadeAt?: string      // data di scadenza calcolata (ISO)
  createdAt: string
  updatedAt: string
  // Per portarlo in cima: aggiornato di recente = sale
  bumpedAt: string
}

export interface AnnuncioConProfilo extends Annuncio {
  autore: ProfiloPubblico
}
