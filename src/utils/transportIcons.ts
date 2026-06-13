import { Train, TramFront, Bus, type LucideIcon } from 'lucide-vue-next'

export type TransportMode = 'train' | 'tram' | 'bus'

const iconMap: Record<TransportMode, LucideIcon> = {
  train: Train,
  tram: TramFront,
  bus: Bus,
}

export function categoryToMode(category: string): TransportMode {
  const upper = category.toUpperCase()
  if (upper === 'B' || upper === 'BUS') return 'bus'
  if (upper === 'T' || upper === 'TRAM') return 'tram'
  return 'train'
}

export function getTransportIcon(mode?: TransportMode | string): LucideIcon {
  if (!mode) return Train
  return iconMap[mode.toLowerCase() as TransportMode] ?? Train
}
