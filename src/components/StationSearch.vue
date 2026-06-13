<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Train, TramFront, Bus, MapPin } from 'lucide-vue-next'
import { useTransportApi } from '@/composables/useTransportApi'
import type { Station } from '@/types/transport'
import type { SavedStation } from '@/types/itinerary'

const props = defineProps<{
  modelValue?: SavedStation | null
  label: string
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SavedStation | null]
  select: [station: SavedStation]
}>()

const { t } = useI18n()
const { searchStations, loading, error } = useTransportApi()

const query = ref(props.modelValue?.name ?? '')
const candidates = ref<Station[]>([])
const showDropdown = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | undefined

const iconMap: Record<string, typeof Train> = {
  train: Train,
  tram: TramFront,
  bus: Bus,
}

function getIcon(icon?: string) {
  if (!icon) return MapPin
  return iconMap[icon.toLowerCase()] ?? MapPin
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) query.value = val.name
  }
)

function onInput() {
  clearTimeout(debounceTimer)
  emit('update:modelValue', null)

  if (query.value.trim().length < 2) {
    candidates.value = []
    showDropdown.value = false
    return
  }

  debounceTimer = setTimeout(async () => {
    const results = await searchStations(query.value)
    candidates.value = results
    showDropdown.value = results.length > 0
  }, 300)
}

function selectStation(station: Station) {
  const saved: SavedStation = {
    id: station.id,
    name: station.name,
    icon: station.icon,
  }
  query.value = station.name
  candidates.value = []
  showDropdown.value = false
  emit('update:modelValue', saved)
  emit('select', saved)
}

function onBlur() {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}
</script>

<template>
  <div class="form-control relative w-full">
    <label class="label">
      <span class="label-text font-medium">{{ label }}</span>
    </label>
    <div class="relative">
      <input
        v-model="query"
        type="text"
        class="input input-bordered w-full pr-10"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="onInput"
        @blur="onBlur"
        @focus="showDropdown = candidates.length > 0"
      />
      <span
        v-if="loading"
        class="loading loading-spinner loading-sm absolute right-3 top-1/2 -translate-y-1/2"
      />
    </div>

    <!-- Dropdown -->
    <ul
      v-if="showDropdown && candidates.length > 0"
      class="menu dropdown-content z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-box bg-base-100 p-2 shadow-lg"
    >
      <li v-for="station in candidates" :key="station.id">
        <button
          class="flex items-center gap-2 text-left"
          @mousedown.prevent="selectStation(station)"
        >
          <component :is="getIcon(station.icon)" class="size-4 shrink-0 opacity-60" />
          <span>{{ station.name }}</span>
        </button>
      </li>
    </ul>

    <div
      v-if="showDropdown && candidates.length === 0 && !loading && query.trim().length >= 2"
      class="alert alert-warning mt-1 py-2 text-sm"
    >
      {{ t('stations.noResults') }}
    </div>

    <div v-if="error" class="alert alert-error mt-1 py-2 text-sm">
      {{ t(error) }}
    </div>
  </div>
</template>
