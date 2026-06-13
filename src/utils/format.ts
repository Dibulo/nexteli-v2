/**
 * Parse transport API duration string "00dHH:MM:SS" to total seconds.
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)d(\d+):(\d+):(\d+)/)
  if (!match) return 0
  const [, days, hours, minutes, seconds] = match.map(Number)
  return days * 86400 + hours * 3600 + minutes * 60 + seconds
}

/**
 * Format a date string or timestamp to "HH:mm".
 */
export function formatTime(iso: string | null): string {
  if (!iso) return '--:--'
  const d = new Date(iso)
  return d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Duration in seconds to human-readable minutes.
 */
export function formatDurationMinutes(seconds: number): string {
  const mins = Math.round(seconds / 60)
  return `${mins}'`
}

/**
 * Compute countdown label from departure timestamp.
 */
export function getCountdownLabel(departureTimestampMs: number): string {
  const diff = departureTimestampMs - Date.now()
  if (diff < 60_000) return 'now'
  const minutes = Math.floor(diff / 60_000)
  return `${minutes}'`
}

/**
 * Minutes until departure (can be negative if in the past).
 */
export function minutesUntil(timestampMs: number): number {
  return Math.floor((timestampMs - Date.now()) / 60_000)
}
