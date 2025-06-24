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
      } else if (src.backupType === 'cryptocompare' && src.type === 'cryptocompare_histoday') {
        // CryptoCompare returns { Data: { Data: [ { time, close }, ... ] } }
        data = {
          prices: data.Data.Data.map(point => [point.time * 1000, point.close])
        };
      } else if (src.backupType === 'coinlore' && src.type === 'coinlore_history') {
        // Coinlore returns an array of objects with 'price' and 'date' (date is not always present)
        // We'll synthesize timestamps assuming daily data, most recent last
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        data = {
          prices: data.map((point, i) => [now - (data.length - 1 - i) * oneDay, Number(point.price)])
        };
      } else if (src.backupType === 'messari' && src.type === 'messari_history') {
        // Messari returns { data: { values: [[timestamp, open, high, low, close], ...] } }
        data = {
          prices: data.data.values.map(point => [point[0], point[4]])
        };
      } else if (src.backupType === 'coinlore' && src.type === 'coinlore_coins') {
        // Coinlore returns { data: [ { id, symbol, name, price_usd, market_cap_usd, ... } ] }
        data = data.data.slice(0, 100).map(coin => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          current_price: Number(coin.price_usd),
          market_cap: Number(coin.market_cap_usd),
        }));
      } else if (src.backupType === 'messari' && src.type === 'messari_coins') {
        // Messari returns { data: [ { id, symbol, name, metrics: { market_data: { price_usd, marketcap_usd } } } ] }
        data = data.data.slice(0, 100).map(coin => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          current_price: coin.metrics && coin.metrics.market_data ? Number(coin.metrics.market_data.price_usd) : 0,
          market_cap: coin.metrics && coin.metrics.market_data ? Number(coin.metrics.market_data.marketcap_usd) : 0,
        }));
      } else if (src.backupType === 'coinstats' && src.type === 'coinstats_coins') {
        // CoinStats returns { coins: [ { id, symbol, name, price, marketCap, ... } ] }
        data = data.coins.slice(0, 100).map(coin => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          current_price: Number(coin.price),
          market_cap: Number(coin.marketCap),
        }));
      } else if (src.backupType === 'cryptocompare' && src.type === 'cryptocompare_coins') {
        // CryptoCompare returns { Data: { [symbol]: { Id, Symbol, CoinName, ... } } }
        data = Object.values(data.Data).slice(0, 100).map(coin => ({
          id: coin.Id,
          symbol: coin.Symbol,
          name: coin.CoinName,
          current_price: 0, // CryptoCompare does not provide price in this endpoint
          market_cap: 0,
        }));
      } else if (src.backupType === 'coinmarketcap' && src.type === 'cmc_history') {
        // CoinMarketCap returns { data: { quotes: [ { timestamp, quote: { USD: { price } } } ] } }
        data = {
          prices: data.data.quotes.map(point => [new Date(point.timestamp).getTime(), point.quote.USD.price])
        };
      } else if (src.backupType === 'nomics' && src.type === 'nomics_history') {
        // Nomics returns [ { currency, timestamps: [], prices: [] } ]
        if (Array.isArray(data) && data.length > 0) {
          data = {
            prices: data[0].timestamps.map((t, i) => [new Date(t).getTime(), Number(data[0].prices[i])])
          };
        } else {
          data = { prices: [] };
        }
      } else if (src.backupType === 'binance' && src.type === 'binance_history') {
        // Binance returns [ [openTime, open, high, low, close, ...], ... ]
        data = {
          prices: data.map(point => [point[0], Number(point[4])])
        };
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