type CacheEntry<T> = {
  value: T
  expiresAt: number
}

function storageKey(namespace: string, key: string): string {
  return `nexteli:cache:${namespace}:${key}`
}

function namespacePrefix(namespace: string): string {
  return `nexteli:cache:${namespace}:`
}

/**
 * Create a namespaced localStorage TTL cache.
 * Failures reading/writing are swallowed — cache is best-effort.
 */
export function createCache(namespace: string) {
  function get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(storageKey(namespace, key))
      if (!raw) return null

      const entry = JSON.parse(raw) as CacheEntry<T>
      if (
        typeof entry !== 'object' ||
        entry === null ||
        !('value' in entry) ||
        typeof entry.expiresAt !== 'number'
      ) {
        remove(key)
        return null
      }

      if (Date.now() >= entry.expiresAt) {
        remove(key)
        return null
      }

      return entry.value
    } catch {
      return null
    }
  }

  function set<T>(key: string, value: T, ttlMs: number): void {
    try {
      const entry: CacheEntry<T> = {
        value,
        expiresAt: Date.now() + ttlMs,
      }
      localStorage.setItem(storageKey(namespace, key), JSON.stringify(entry))
    } catch {
      // Quota or private mode — ignore
    }
  }

  function remove(key: string): void {
    try {
      localStorage.removeItem(storageKey(namespace, key))
    } catch {
      // ignore
    }
  }

  function clear(): void {
    try {
      const prefix = namespacePrefix(namespace)
      const toRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k?.startsWith(prefix)) toRemove.push(k)
      }
      for (const k of toRemove) localStorage.removeItem(k)
    } catch {
      // ignore
    }
  }

  async function getOrFetch<T>(
    key: string,
    ttlMs: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = get<T>(key)
    if (cached !== null) return cached

    const value = await fetcher()
    set(key, value, ttlMs)
    return value
  }

  return { get, set, remove, clear, getOrFetch }
}
