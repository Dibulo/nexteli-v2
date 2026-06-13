import { ref, watch, onUnmounted, type MaybeRef, toValue } from 'vue'
import { getCountdownLabel } from '@/utils/format'

export function useCountdown(departureTimestampMs: MaybeRef<number>) {
  const countdownLabel = ref(getCountdownLabel(toValue(departureTimestampMs)))
  const expired = ref(false)

  let timer: ReturnType<typeof setInterval> | undefined

  function update() {
    const ts = toValue(departureTimestampMs)
    const diff = ts - Date.now()
    if (diff < -60_000) {
      expired.value = true
      countdownLabel.value = ''
      clearInterval(timer)
      return
    }
    countdownLabel.value = getCountdownLabel(ts)
  }

  timer = setInterval(update, 10_000)
  update()

  watch(
    () => toValue(departureTimestampMs),
    () => update()
  )

  onUnmounted(() => {
    clearInterval(timer)
  })

  return { countdownLabel, expired }
}
