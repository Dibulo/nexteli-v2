#!/usr/bin/env node
/**
 * Builds src/data/lineColors.json from:
 * 1. swiss-transit-colors agency_colors.yml (broad coverage)
 * 2. ZVV/VBZ GTFS routes.txt (official Zürich colors, overrides on conflict)
 */
import { createWriteStream } from 'node:fs'
import { mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { parse as parseYaml } from 'yaml'

const execFileAsync = promisify(execFile)

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_PATH = join(ROOT, 'src/data/lineColors.json')

const SWISS_COLORS_URL =
  'https://raw.githubusercontent.com/vasile/swiss-transit-colors/master/agency_colors.yml'
const ZVV_GTFS_URL =
  'https://data.stadt-zuerich.ch/dataset/vbz_fahrplandaten_gtfs/download/2026_google_transit.zip'

/** @typedef {{ bg: string, fg: string }} LineColor */

/**
 * @param {string} hex
 * @returns {string | null}
 */
function normalizeHex(hex) {
  if (!hex || typeof hex !== 'string') return null
  let h = hex.trim().replace(/^#/, '').toUpperCase()
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  }
  if (!/^[0-9A-F]{6}$/.test(h)) return null
  return `#${h}`
}

/**
 * @param {string | null | undefined} bg
 * @param {string | null | undefined} fg
 * @returns {LineColor | null}
 */
function toColor(bg, fg) {
  const background = normalizeHex(bg ?? '')
  if (!background) return null
  const foreground = normalizeHex(fg ?? '') ?? '#000000'
  // Skip white-on-white / unset placeholders
  if (background === '#FFFFFF' && foreground === '#FFFFFF') return null
  return { bg: background, fg: foreground }
}

/**
 * Collapse internal whitespace runs to a single space; trim ends.
 * @param {string} s
 */
function collapseWs(s) {
  return s.trim().replace(/\s+/g, ' ')
}

/**
 * @param {string} operator
 * @param {string} category
 * @param {string} number
 */
function makeKey(operator, category, number) {
  return `${operator}|${category}|${number}`
}

/**
 * @param {Record<string, LineColor>} map
 * @param {string} operator
 * @param {string} category
 * @param {string} number
 * @param {LineColor} color
 * @param {boolean} overwrite
 */
function putColor(map, operator, category, number, color, overwrite) {
  const keys = new Set([operator, collapseWs(operator)])
  for (const op of keys) {
    if (!op) continue
    const key = makeKey(op, category, number)
    if (!overwrite && map[key]) continue
    map[key] = color
  }
}

/**
 * @param {Record<string, LineColor>} map
 * @param {unknown} data
 */
function ingestSwissTransitColors(map, data) {
  const agencies = data?.agency
  if (!agencies || typeof agencies !== 'object') return

  for (const agency of Object.values(agencies)) {
    if (!agency || typeof agency !== 'object') continue
    const shortName = agency.short_name
    if (typeof shortName !== 'string' || !shortName.trim()) continue

    const vehicleTypes = agency.vehicle_types
    if (!vehicleTypes || typeof vehicleTypes !== 'object') continue

    for (const [category, lines] of Object.entries(vehicleTypes)) {
      if (!lines || typeof lines !== 'object') continue
      for (const [number, entry] of Object.entries(lines)) {
        if (number === 'ALL_LINES') continue
        if (!entry || typeof entry !== 'object') continue
        const color = toColor(entry.bg, entry.fg)
        if (!color) continue
        putColor(map, shortName, category, number, color, false)
      }
    }
  }
}

/** GTFS route_type → stationboard category codes */
const ROUTE_TYPE_CATEGORIES = {
  0: ['T', 'TRAM'],
  1: ['M', 'METRO'],
  2: ['S', 'RE', 'IR', 'IC', 'EC', 'R'],
  3: ['B', 'BUS'],
  4: ['BAT', 'FAE'],
  5: ['CB'],
  6: ['FUN'],
  7: ['PB'],
}

/**
 * @param {Record<string, LineColor>} map
 * @param {string} routesCsv
 */
function ingestZvvRoutes(map, routesCsv) {
  const lines = routesCsv.replace(/^\uFEFF/, '').split(/\r?\n/)
  if (lines.length < 2) return

  const header = parseCsvLine(lines[0])
  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]))

  const shortIdx = idx.route_short_name
  const colorIdx = idx.route_color
  const textIdx = idx.route_text_color
  const typeIdx = idx.route_type
  if (shortIdx == null || colorIdx == null || typeIdx == null) {
    throw new Error('ZVV routes.txt missing expected columns')
  }

  const operators = ['VBZ', 'VBZ F', 'VBZ    F']

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i]
    if (!row.trim()) continue
    const cols = parseCsvLine(row)
    const number = (cols[shortIdx] ?? '').trim()
    if (!number) continue

    const color = toColor(cols[colorIdx], cols[textIdx] ?? '000000')
    if (!color) continue

    const routeType = Number.parseInt((cols[typeIdx] ?? '').trim(), 10)
    const categories = ROUTE_TYPE_CATEGORIES[routeType] ?? []
    if (categories.length === 0) continue

    for (const op of operators) {
      for (const category of categories) {
        putColor(map, op, category, number, color, true)
      }
    }
  }
}

/**
 * Minimal CSV line parser (handles quoted fields).
 * @param {string} line
 * @returns {string[]}
 */
function parseCsvLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      out.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out
}

/**
 * @param {string} url
 * @param {string} dest
 */
async function downloadFile(url, dest) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`)
  }
  await pipeline(res.body, createWriteStream(dest))
}

async function main() {
  const tmp = await mkdtemp(join(tmpdir(), 'nexteli-colors-'))
  try {
    console.log('Downloading swiss-transit-colors…')
    const yamlText = await fetch(SWISS_COLORS_URL).then(async (res) => {
      if (!res.ok) throw new Error(`swiss-transit-colors: ${res.status}`)
      return res.text()
    })
    const yamlData = parseYaml(yamlText, { maxAliasCount: -1 })

    /** @type {Record<string, LineColor>} */
    const map = {}
    ingestSwissTransitColors(map, yamlData)
    const afterSwiss = Object.keys(map).length
    console.log(`  ${afterSwiss} keys from swiss-transit-colors`)

    console.log('Downloading ZVV GTFS…')
    const zipPath = join(tmp, 'gtfs.zip')
    await downloadFile(ZVV_GTFS_URL, zipPath)

    const routesPath = join(tmp, 'routes.txt')
    await execFileAsync('unzip', ['-p', zipPath, 'routes.txt'], {
      maxBuffer: 10 * 1024 * 1024,
      encoding: 'utf8',
    }).then(async ({ stdout }) => {
      await writeFile(routesPath, stdout, 'utf8')
    })

    const routesCsv = await readFile(routesPath, 'utf8')
    ingestZvvRoutes(map, routesCsv)
    console.log(`  ${Object.keys(map).length} keys after ZVV override`)

    const sorted = Object.fromEntries(
      Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
    )

    await mkdir(dirname(OUT_PATH), { recursive: true })
    await writeFile(OUT_PATH, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8')
    console.log(`Wrote ${OUT_PATH} (${Object.keys(sorted).length} entries)`)
  } finally {
    await rm(tmp, { recursive: true, force: true })
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
