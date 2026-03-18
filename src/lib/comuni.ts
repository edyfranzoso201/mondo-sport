// Database coordinate comuni italiani
// Usato per calcolare distanze reali tra comuni nel filtro km

export const COORDINATE_COMUNI: Record<string, [number, number]> = {
  // Piemonte
  'torino': [45.0703, 7.6869], 'grugliasco': [45.0628, 7.5783], 'moncalieri': [44.9983, 7.6822],
  'collegno': [45.0786, 7.5632], 'rivoli': [45.0712, 7.5122], 'nichelino': [44.9956, 7.6439],
  'settimo torinese': [45.1378, 7.7636], 'chieri': [44.9958, 7.8231], 'pinerolo': [44.8882, 7.3530],
  'chivasso': [45.1902, 7.8879], 'ivrea': [45.4657, 7.8748], 'orbassano': [44.9928, 7.5354],
  'carmagnola': [44.8500, 7.7167], 'bra': [44.6950, 7.8535], 'alba': [44.6986, 8.0358],
  'novara': [45.4468, 8.6220], 'asti': [44.9004, 8.2065], 'cuneo': [44.3865, 7.5422],
  'alessandria': [44.9122, 8.6151], 'biella': [45.5659, 8.0531], 'vercelli': [45.3274, 8.4249],
  'verbania': [45.9215, 8.5512], 'casale monferrato': [45.1333, 8.4500],
  // Lombardia
  'milano': [45.4642, 9.1900], 'bergamo': [45.6983, 9.6773], 'brescia': [45.5416, 10.2118],
  'como': [45.8080, 9.0852], 'cremona': [45.1327, 10.0227], 'lecco': [45.8566, 9.3956],
  'lodi': [45.3145, 9.5027], 'mantova': [45.1564, 10.7914], 'monza': [45.5845, 9.2745],
  'pavia': [45.1847, 9.1582], 'sondrio': [46.1697, 9.8722], 'varese': [45.8206, 8.8257],
  'cinisello balsamo': [45.5586, 9.2139], 'sesto san giovanni': [45.5339, 9.2378],
  // Veneto
  'venezia': [45.4408, 12.3155], 'verona': [45.4384, 10.9916], 'padova': [45.4064, 11.8768],
  'vicenza': [45.5455, 11.5354], 'treviso': [45.6669, 12.2420], 'belluno': [46.1399, 12.2156],
  'rovigo': [45.0711, 11.7897], 'mestre': [45.4922, 12.2421],
  // Emilia-Romagna
  'forlì': [44.2227, 12.0407], 'cesena': [44.1391, 12.2427],
  'piacenza': [45.0526, 9.6930],
  // Toscana
  'firenze': [43.7696, 11.2558], 'prato': [43.8777, 11.1026], 'livorno': [43.5485, 10.3106],
  'arezzo': [43.4636, 11.8796], 'siena': [43.3186, 11.3307], 'grosseto': [42.7640, 11.1140],
  'lucca': [43.8430, 10.5077], 'massa': [44.0352, 10.1372], 'pistoia': [43.9333, 10.9178],
  'pisa': [43.7228, 10.4017],
  // Lazio
  'roma': [41.9028, 12.4964], 'latina': [41.4676, 12.9040], 'frosinone': [41.6384, 13.3425],
  'viterbo': [42.4161, 12.1058], 'rieti': [42.4040, 12.8626],
  // Campania
  'napoli': [40.8518, 14.2681], 'salerno': [40.6824, 14.7681], 'caserta': [41.0740, 14.3322],
  'benevento': [41.1297, 14.7811], 'avellino': [40.9143, 14.7900],
  // Sicilia
  'palermo': [38.1157, 13.3615], 'catania': [37.5079, 15.0830], 'messina': [38.1938, 15.5540],
  'siracusa': [37.0755, 15.2866], 'ragusa': [36.9286, 14.7153], 'trapani': [38.0162, 12.5121],
  'agrigento': [37.3111, 13.5765], 'caltanissetta': [37.4909, 14.0589],
  // Puglia
  'bari': [41.1171, 16.8719], 'taranto': [40.4644, 17.2470], 'foggia': [41.4621, 15.5440],
  'lecce': [40.3516, 18.1750], 'brindisi': [40.6327, 17.9415], 'andria': [41.2299, 16.2961],
  // Calabria
  'reggio calabria': [38.1113, 15.6636], 'catanzaro': [38.9098, 16.5877], 'cosenza': [39.2984, 16.2544],
  // Sardegna
  'cagliari': [39.2238, 9.1217], 'sassari': [40.7259, 8.5556], 'nuoro': [40.3213, 9.3267],
  // Altre città principali
  'genova': [44.4056, 8.9463], 'trieste': [45.6495, 13.7768],
  'trento': [46.0748, 11.1217], 'bolzano': [46.4983, 11.3548], 'udine': [46.0711, 13.2347],
  'perugia': [43.1122, 12.3888], 'ancona': [43.6158, 13.5189], 'pescara': [42.4618, 14.2160],
  "l'aquila": [42.3498, 13.3995], 'campobasso': [41.5600, 14.6556],
  'potenza': [40.6403, 15.8056],
  'aosta': [45.7372, 7.3202],
}

export function getCoords(comune: string): [number, number] | null {
  return COORDINATE_COMUNI[comune.toLowerCase().trim()] || null
}

export function distanzaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// Cerca comune per nome parziale (per autocomplete)
export function cercaComune(query: string): string[] {
  const q = query.toLowerCase().trim()
  if (q.length < 2) return []
  return Object.keys(COORDINATE_COMUNI)
    .filter(c => c.startsWith(q))
    .slice(0, 8)
    .map(c => c.charAt(0).toUpperCase() + c.slice(1))
}
