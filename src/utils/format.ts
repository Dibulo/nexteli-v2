/**
 * Format a date string or timestamp to "HH:mm".
 */
export function formatTime(iso: string | null): string {
  if (!iso) return '--:--'
  const d = new Date(iso)
  return d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
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
