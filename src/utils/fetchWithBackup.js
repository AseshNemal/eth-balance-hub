import { fetchWithCache } from './fetchWithCache';

// Helper to map CoinCap asset to CoinGecko coin format
function mapCoinCapAssetToCoinGecko(asset) {
  return {
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    image: '', // CoinCap does not provide images
    current_price: Number(asset.priceUsd),
    market_cap: Number(asset.marketCapUsd),
    price_change_percentage_24h: Number(asset.changePercent24Hr),
  };
}

// Helper to map CoinPaprika ticker to CoinGecko coin format
function mapPaprikaTickerToCoinGecko(ticker) {
  return {
    id: ticker.id,
    symbol: ticker.symbol,
    name: ticker.name,
    image: '',
    current_price: Number(ticker.quotes.USD.price),
    market_cap: Number(ticker.quotes.USD.market_cap),
    price_change_percentage_24h: Number(ticker.quotes.USD.percent_change_24h),
  };
}

// Helper to map CoinCap history to CoinGecko market_chart format
function mapCoinCapHistoryToMarketChart(history) {
  return {
    prices: history.data.map(point => [new Date(point.date).getTime(), Number(point.priceUsd)])
  };
}

// Helper to map Paprika historical OHLCV to CoinGecko market_chart format
function mapPaprikaHistoryToMarketChart(history) {
  return {
    prices: history.map(point => [new Date(point.timestamp).getTime(), Number(point.close)])
  };
}

// Helper to map CoinCap global to CoinGecko global format
function mapCoinCapGlobalToCoinGecko(global) {
  return {
    data: {
      active_cryptocurrencies: global.data.active_cryptocurrencies || 0,
      total_market_cap: { usd: Number(global.data.total_market_cap_usd) },
      total_volume: { usd: Number(global.data.total_volume_usd) },
      market_cap_percentage: { btc: Number(global.data.bitcoin_percentage_of_market_cap) },
    }
  };
}

// Helper to map Paprika global to CoinGecko global format
function mapPaprikaGlobalToCoinGecko(global) {
  return {
    data: {
      active_cryptocurrencies: global.cryptocurrencies_number,
      total_market_cap: { usd: Number(global.market_cap_usd) },
      total_volume: { usd: Number(global.volume_24h_usd) },
      market_cap_percentage: { btc: Number(global.bitcoin_dominance_percentage) },
    }
  };
}

function isEmptyData(data) {
  if (!data) return true;
  if (Array.isArray(data) && data.length === 0) return true;
  if (typeof data === 'object' && data !== null) {
    if ('prices' in data && Array.isArray(data.prices) && data.prices.length === 0) return true;
    if ('data' in data && typeof data.data === 'object' && Object.keys(data.data).length === 0) return true;
  }
  return false;
}

// Multi-backup fetcher
export async function fetchWithMultiBackup({
  sources, // [{ url, cacheKey, type, backupType }, ...]
  maxAge = 600,
  forceRefresh = false,
  isEmpty = isEmptyData,
}) {
  let lastError = null;
  for (const src of sources) {
    try {
      let data = await fetchWithCache(src.url, { cacheKey: src.cacheKey, maxAge, forceRefresh });
      // Normalize data if needed
      if (src.backupType === 'coincap') {
        if (src.type === 'coins') {
          data = data.data.slice(0, 10).map(mapCoinCapAssetToCoinGecko);
        } else if (src.type === 'market_chart') {
          data = mapCoinCapHistoryToMarketChart(data);
        } else if (src.type === 'simple_price') {
          data = { [data.data.id]: { usd: Number(data.data.priceUsd) } };
        } else if (src.type === 'global') {
          data = mapCoinCapGlobalToCoinGecko(data);
        }
      } else if (src.backupType === 'coinpaprika') {
        if (src.type === 'coins') {
          data = data.slice(0, 10).map(mapPaprikaTickerToCoinGecko);
        } else if (src.type === 'market_chart') {
          data = mapPaprikaHistoryToMarketChart(data);
        } else if (src.type === 'simple_price') {
          data = { [data.id]: { usd: Number(data.quotes.USD.price) } };
        } else if (src.type === 'global') {
          data = mapPaprikaGlobalToCoinGecko(data);
        }
      }
      if (!isEmpty(data)) return data;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('All APIs failed or returned empty');
}

// Keep the original fetchWithBackup for backward compatibility
export async function fetchWithBackup({
  primaryUrl,
  backupUrl,
  cacheKey,
  maxAge = 600,
  forceRefresh = false,
  type = 'coins',
  backupType = 'coincap',
}) {
  return fetchWithMultiBackup({
    sources: [
      { url: primaryUrl, cacheKey, type, backupType: 'coingecko' },
      { url: backupUrl, cacheKey: cacheKey + '_backup', type, backupType },
    ],
    maxAge,
    forceRefresh,
  });
} 