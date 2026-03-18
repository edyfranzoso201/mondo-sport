/**
 * Incrementa automaticamente la versione
 * Uso: npx tsx scripts/bump-version.ts
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const path = resolve(process.cwd(), 'src/lib/versione.ts')
const content = readFileSync(path, 'utf8')

const match = content.match(/VERSIONE = 'v(\d+)\.(\d+)'/)
if (!match) { console.error('Versione non trovata'); process.exit(1) }

const major = Number(match[1])
const minor = Number(match[2])
const nuovaVersione = `v${major}.${minor + 1}`
const oggi = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })

const nuovoContenuto = content
  .replace(/VERSIONE = 'v\d+\.\d+'/, `VERSIONE = '${nuovaVersione}'`)
  .replace(/DATA_REVISIONE = '\d{2}\/\d{2}\/\d{4}'/, `DATA_REVISIONE = '${oggi}'`)

writeFileSync(path, nuovoContenuto)
console.log(`✅ Versione aggiornata: ${match[0].match(/v\d+\.\d+/)?.[0]} → ${nuovaVersione} (${oggi})`)
