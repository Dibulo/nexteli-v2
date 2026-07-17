import lineColors from '@/data/lineColors.json'

export interface LineColor {
  bg: string
  fg: string
}

type ColorMap = Record<string, LineColor>

const colors = lineColors as ColorMap

function collapseWs(s: string): string {
  return s.trim().replace(/\s+/g, ' ')
}

/**
 * Operator variants to try when looking up line colors.
 * Handles API quirks like "VBZ    F" vs "VBZ F" vs "VBZ".
 */
function operatorVariants(operator: string | null | undefined): string[] {
  if (!operator?.trim()) return []
  const raw = operator.trim()
  const collapsed = collapseWs(raw)
  const variants = new Set<string>([raw, collapsed])

  // Drop trailing INFO+ / single-letter suffixes: "VBZ F" → "VBZ"
  const withoutSuffix = collapsed.replace(/\s+[A-Za-z]$/, '').trim()
  if (withoutSuffix) variants.add(withoutSuffix)

  return [...variants]
}

function makeKey(operator: string, category: string, number: string): string {
  return `${operator}|${category}|${number}`
}

/**
 * Resolve official/curated line colors for a stationboard departure.
 * Returns undefined when unknown — callers should fall back to mode colors.
 */
export function lookupLineColor(
  operator: string | null | undefined,
  category: string | null | undefined,
  number: string | null | undefined
): LineColor | undefined {
  const cat = (category ?? '').trim()
  const num = (number ?? '').trim()
  if (!cat || !num) return undefined

  const categories = new Set<string>([cat, cat.toUpperCase()])

  for (const op of operatorVariants(operator)) {
    for (const c of categories) {
      const hit = colors[makeKey(op, c, num)]
      if (hit) return hit
    }
  }

  return undefined
}
