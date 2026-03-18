// Colori per tipo utente — usati in card, avatar, badge
export const TIPO_COLORS: Record<string, {
  border: string
  bg: string
  text: string
  avatar: string
  avatarText: string
  badge: string
  badgeText: string
}> = {
  atleta: {
    border: '#4a7c8e',
    bg: '#e8f3f6',
    text: '#4a7c8e',
    avatar: '#4a7c8e',
    avatarText: '#ffffff',
    badge: '#e8f3f6',
    badgeText: '#2a5a6e',
  },
  societa: {
    border: '#e8a030',
    bg: '#fef3e2',
    text: '#c07820',
    avatar: '#e8a030',
    avatarText: '#1a1200',
    badge: '#fef3e2',
    badgeText: '#8a5200',
  },
  staff: {
    border: '#7c3d9e',
    bg: '#f3eafb',
    text: '#7c3d9e',
    avatar: '#7c3d9e',
    avatarText: '#ffffff',
    badge: '#f3eafb',
    badgeText: '#5a2a7e',
  },
  admin: {
    border: '#374151',
    bg: '#f3f4f6',
    text: '#374151',
    avatar: '#374151',
    avatarText: '#ffffff',
    badge: '#f3f4f6',
    badgeText: '#1f2937',
  },
}

export function getTipoColors(tipo: string) {
  return TIPO_COLORS[tipo] || TIPO_COLORS.atleta
}

export const TIPO_LABEL: Record<string, string> = {
  atleta: 'Atleta',
  societa: 'Società',
  staff: 'Staff',
  admin: 'Admin',
}
