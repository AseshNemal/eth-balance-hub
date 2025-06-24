// Utility to fetch data with localStorage caching
// Usage: fetchWithCache(url, { cacheKey, maxAge, forceRefresh })

export async function fetchWithCache(url, { cacheKey, maxAge = 600, forceRefresh = false } = {}) {
  if (!cacheKey) cacheKey = url;
  const now = Date.now();
  const cached = localStorage.getItem(cacheKey);
  if (cached && !forceRefresh) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (now - timestamp < maxAge * 1000) {
        return data;
      }
    } catch {}
  }
  // Fetch from API
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network response was not ok');
  const data = await res.json();
  localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));
  return data;
} 