# 🌍 Mondo Sport

Piattaforma per atleti e società sportive — trova squadra, trova giocatori, trova staff tecnico.

## Stack tecnico

| Tecnologia | Versione | Utilizzo |
|---|---|---|
| **Next.js** | 15.5.12 | Framework frontend + API routes |
| **TypeScript** | 5.x | Type safety completa |
| **Upstash Redis** | 1.34.x | Database principale (KV store) |
| **NextAuth** | 5.0.0-beta.25 | Autenticazione sessioni JWT |
| **Nodemailer** | 7.x | Email verifica, approvazione, alert |
| **Tailwind CSS** | 3.x | Utility styles |
| **Zod** | 3.x | Validazione form/API |

---

## Setup in 5 minuti

### 1. Installa le dipendenze

```powershell
cd mondo-sport
npm install
```

> Il file `.npmrc` già incluso gestisce automaticamente i peer deps — nessun errore ERESOLVE.

### 2. Configura le variabili d'ambiente

Il file `.env.local` contiene già le chiavi Redis di Upstash.
Aggiungi le credenziali email e genera il secret NextAuth:

```env
# Genera un secret sicuro con:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXTAUTH_SECRET="incolla-qui-il-risultato"
NEXTAUTH_URL="http://localhost:3000"

# Email (Gmail esempio)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tua@gmail.com"
SMTP_PASS="xxxx-xxxx-xxxx-xxxx"   # App Password Gmail
SMTP_FROM="Mondo Sport <tua@gmail.com>"

ADMIN_EMAIL="tua@gmail.com"
```

### 3. Crea il primo amministratore

```powershell
npm run seed:admin
```

Output:
```
✅ Admin creato!
📧 Email:    admin@mondosport.it
🔑 Password: Admin@MondoSport2024!
```

⚠️ Cambia la password dopo il primo accesso!

### 4. Avvia in sviluppo

```powershell
npm run dev
```

Apri → http://localhost:3000

---

## Deploy su Vercel

```powershell
# 1. Push su GitHub
git init && git add . && git commit -m "init"
git remote add origin https://github.com/TUO-USER/mondo-sport
git push -u origin main

# 2. Su vercel.com → New Project → importa il repo
# 3. Aggiungi le variabili da .env.local nel pannello Vercel
# 4. Cambia NEXTAUTH_URL con il tuo dominio Vercel
```

---

## App Gmail per SMTP

1. Attiva 2FA su Google
2. Vai su https://myaccount.google.com/apppasswords
3. Crea App Password → seleziona "Posta"
4. Usa quella password in `SMTP_PASS`

---

## Struttura dati Redis

| Chiave | Tipo | Contenuto |
|---|---|---|
| `user:{id}` | String | JSON utente completo |
| `user:email:{email}` | String | userId |
| `user:alias:{alias}` | String | userId |
| `users:pending` | Set | userId in attesa approvazione |
| `users:approved` | Set | userId approvati |
| `profile:{id}` | String | JSON profilo pubblico |
| `idx:sport:{sport}` | Set | userId per sport |
| `idx:regione:{regione}` | Set | userId per regione |
| `idx:ruolo:{ruolo}` | Set | userId per ruolo |
| `idx:cat:{categoria}` | Set | userId per categoria |
| `conv:{id}` | String | JSON conversazione |
| `msgs:{convId}` | List | Messaggi (max 500) |
| `user:convs:{uid}` | Set | conversazioneId per utente |
| `alerts:{uid}` | String | JSON array alert |
| `verify:{token}` | String | userId (TTL 24h) |
