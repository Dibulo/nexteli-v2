export interface Coordinates {
  type: 'WGS84'
  x: number
  y: number
}

export interface Station {
  id: string
  name: string
  score: number | null
  coordinate: Coordinates
  distance?: number | null
  icon?: string
}

export interface LocationsResponse {
  stations: Station[]
}

export interface Prognosis {
  platform: string | null
  arrival: string | null
  departure: string | null
  capacity1st: string | null
  capacity2nd: string | null
}

export interface ConnectionCheckpoint {
  station: Station
  arrival: string | null
  arrivalTimestamp: number | null
  departure: string | null
  departureTimestamp: number | null
  delay?: number | null
  platform: string | null
  prognosis: Prognosis
}

export interface Journey {
  name: string
  category: string
  categoryCode: string
  number: string
  operator: string | null
  to: string
}

export interface Section {
  journey: Journey | null
  walk: unknown | null
  departure: ConnectionCheckpoint
  arrival: ConnectionCheckpoint
}

export interface Connection {
  from: ConnectionCheckpoint
  to: ConnectionCheckpoint
  duration: string
  products: string[]
  sections: Section[]
}

export interface ConnectionsResponse {
  connections: Connection[]
}

export interface StationboardEntry {
  stop: ConnectionCheckpoint
  name: string
  category: string
  number: string
  operator: string | null
  to: string
  passList?: ConnectionCheckpoint[]
}

export interface StationboardResponse {
  station: Station
  stationboard: StationboardEntry[]
}
