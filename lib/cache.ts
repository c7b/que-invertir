const CACHE_DURATION = 1000 * 60 * 5; // 5 minutos

type CacheItem = {
  data: any;
  timestamp: number;
}

const cache: Map<string, CacheItem> = new Map();

export async function getCachedData(key: string, fetchFn: () => Promise<any>) {
  const cached = cache.get(key);
  const now = Date.now();

  // Si hay caché válido, usarlo
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  // Si no hay caché o expiró, fetch nuevos datos
  const data = await fetchFn();
  cache.set(key, { data, timestamp: now });
  return data;
}
