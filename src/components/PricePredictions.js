import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './PricePredictions.css';
import { fetchWithMultiBackup } from '../utils/fetchWithBackup';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const COINS = [
  { id: 'ethereum', name: 'Ethereum (ETH)' },
  { id: 'bitcoin', name: 'Bitcoin (BTC)' },
  { id: 'tether', name: 'Tether (USDT)' },
  { id: 'usd-coin', name: 'USD Coin (USDC)' },
  { id: 'binancecoin', name: 'BNB' },
  { id: 'solana', name: 'Solana (SOL)' },
  { id: 'dogecoin', name: 'Dogecoin (DOGE)' },
];

const COIN_ID_MAP = {
  ethereum: {
    coingecko: 'ethereum',
    coincap: 'ethereum',
    coinpaprika: 'eth-ethereum',
  },
  bitcoin: {
    coingecko: 'bitcoin',
    coincap: 'bitcoin',
    coinpaprika: 'btc-bitcoin',
  },
  tether: {
    coingecko: 'tether',
    coincap: 'tether',
    coinpaprika: 'usdt-tether',
  },
  'usd-coin': {
    coingecko: 'usd-coin',
    coincap: 'usd-coin',
    coinpaprika: 'usdc-usd-coin',
  },
  binancecoin: {
    coingecko: 'binancecoin',
    coincap: 'binance-coin',
    coinpaprika: 'bnb-binance-coin',
  },
  solana: {
    coingecko: 'solana',
    coincap: 'solana',
    coinpaprika: 'sol-solana',
  },
  dogecoin: {
    coingecko: 'dogecoin',
    coincap: 'dogecoin',
    coinpaprika: 'doge-dogecoin',
  },
};

const COIN_SYMBOL_MAP = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
  tether: 'USDT',
  'usd-coin': 'USDC',
  binancecoin: 'BNB',
  solana: 'SOL',
  dogecoin: 'DOGE',
};

const COINLORE_ID_MAP = {
  ethereum: 80,
  bitcoin: 90,
  binancecoin: 2710,
  dogecoin: 2,
  // ...add more as needed
};
const MESSARI_SYMBOL_MAP = {
  ethereum: 'eth',
  bitcoin: 'btc',
  binancecoin: 'bnb',
  dogecoin: 'doge',
  // ...add more as needed
};

const CMC_ID_MAP = {
  ethereum: 1027,
  bitcoin: 1,
  binancecoin: 1839,
  dogecoin: 74,
  // ...add more as needed
};
const NOMICS_SYMBOL_MAP = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
  binancecoin: 'BNB',
  dogecoin: 'DOGE',
  // ...add more as needed
};
const BINANCE_SYMBOL_MAP = {
  ethereum: 'ETHUSDT',
  bitcoin: 'BTCUSDT',
  binancecoin: 'BNBUSDT',
  dogecoin: 'DOGEUSDT',
  // ...add more as needed
};

function linearRegression(y) {
  // y: array of prices
  const n = y.length;
  const x = Array.from({ length: n }, (_, i) => i + 1);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumXX = x.reduce((a, b) => a + b * b, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return x.map((xi) => slope * xi + intercept);
}

function funPrediction(y) {
  // Add a random walk to the last price
  const last = y[y.length - 1];
  let pred = [last];
  for (let i = 1; i <= 7; i++) {
    pred.push(pred[pred.length - 1] * (1 + (Math.random() - 0.5) * 0.1));
  }
  return pred;
}

const PricePredictions = () => {
  const [coin, setCoin] = useState(COINS[0].id);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [predictionType, setPredictionType] = useState('trend'); // 'trend' or 'fun'

  useEffect(() => {
    setLoading(true);
    setError(null);
    setWarning(null);
    const ids = COIN_ID_MAP[coin] || { coingecko: coin, coincap: coin, coinpaprika: coin };
    const symbol = COIN_SYMBOL_MAP[coin] || coin.toUpperCase();
    const coinloreId = COINLORE_ID_MAP[coin];
    const messariSymbol = MESSARI_SYMBOL_MAP[coin];
    const cmcId = CMC_ID_MAP[coin];
    const nomicsSymbol = NOMICS_SYMBOL_MAP[coin];
    const binanceSymbol = BINANCE_SYMBOL_MAP[coin];
    const cmcApiKey = process.env.REACT_APP_CMC_API_KEY;
    const nomicsApiKey = process.env.REACT_APP_NOMICS_API_KEY;
    const start = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const end = Date.now();
    const startISO = new Date(start).toISOString();
    const messariStart = new Date(start).toISOString().split('T')[0];
    const messariEnd = new Date(end).toISOString().split('T')[0];
    const chartSources = [
      {
        url: `https://api.coingecko.com/api/v3/coins/${ids.coingecko}/market_chart?vs_currency=usd&days=30`,
        cacheKey: `cg_pred_${ids.coingecko}_30d`,
        type: 'market_chart',
        backupType: 'coingecko',
      },
      {
        url: `https://api.coincap.io/v2/assets/${ids.coincap}/history?interval=d1&start=${start}&end=${end}`,
        cacheKey: `cc_pred_${ids.coincap}_30d`,
        type: 'market_chart',
        backupType: 'coincap',
      },
      {
        url: `https://api.coinpaprika.com/v1/tickers/${ids.coinpaprika}/historical?start=${startISO}&interval=1d`,
        cacheKey: `cp_pred_${ids.coinpaprika}_30d`,
        type: 'market_chart',
        backupType: 'coinpaprika',
      },
      {
        url: `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${symbol}&tsym=USD&limit=30`,
        cacheKey: `ccmp_pred_${symbol}_30d`,
        type: 'cryptocompare_histoday',
        backupType: 'cryptocompare',
      },
      coinloreId && {
        url: `https://api.coinlore.net/api/coin/markets/?id=${coinloreId}`,
        cacheKey: `cl_pred_${coinloreId}_30d`,
        type: 'coinlore_history',
        backupType: 'coinlore',
      },
      messariSymbol && {
        url: `https://data.messari.io/api/v1/assets/${messariSymbol}/metrics/price/time-series?start=${messariStart}&end=${messariEnd}&interval=1d`,
        cacheKey: `ms_pred_${messariSymbol}_30d`,
        type: 'messari_history',
        backupType: 'messari',
      },
      cmcId && cmcApiKey && {
        url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical?id=${cmcId}&convert=USD&count=30`,
        cacheKey: `cmc_pred_${cmcId}_30d`,
        type: 'cmc_history',
        backupType: 'coinmarketcap',
        headers: { 'X-CMC_PRO_API_KEY': cmcApiKey },
      },
      nomicsSymbol && nomicsApiKey && {
        url: `https://api.nomics.com/v1/currencies/sparkline?key=${nomicsApiKey}&ids=${nomicsSymbol}&start=${startISO}`,
        cacheKey: `nomics_pred_${nomicsSymbol}_30d`,
        type: 'nomics_history',
        backupType: 'nomics',
      },
      binanceSymbol && {
        url: `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1d&limit=30`,
        cacheKey: `binance_pred_${binanceSymbol}_30d`,
        type: 'binance_history',
        backupType: 'binance',
      },
    ].filter(Boolean);
    fetchWithMultiBackup({ sources: chartSources })
      .then((data) => {
        setHistory(data.prices.map(([timestamp, price]) => ({
          date: new Date(timestamp).toLocaleDateString(),
          price,
        })));
        setLoading(false);
      })
      .catch(() => {
        // Try to load last cached data
        let cacheKey = `cg_pred_${ids.coingecko}_30d`;
        let cached = localStorage.getItem(cacheKey);
        if (!cached) {
          cacheKey = `cc_pred_${ids.coincap}_30d`;
          cached = localStorage.getItem(cacheKey);
        }
        if (!cached) {
          cacheKey = `cp_pred_${ids.coinpaprika}_30d`;
          cached = localStorage.getItem(cacheKey);
        }
        if (!cached) {
          cacheKey = `ccmp_pred_${symbol}_30d`;
          cached = localStorage.getItem(cacheKey);
        }
        if (!cached && coinloreId) {
          cacheKey = `cl_pred_${coinloreId}_30d`;
          cached = localStorage.getItem(cacheKey);
        }
        if (!cached && messariSymbol) {
          cacheKey = `ms_pred_${messariSymbol}_30d`;
          cached = localStorage.getItem(cacheKey);
        }
        if (!cached && cmcId) {
          cacheKey = `cmc_pred_${cmcId}_30d`;
          cached = localStorage.getItem(cacheKey);
        }
        if (!cached && nomicsSymbol) {
          cacheKey = `nomics_pred_${nomicsSymbol}_30d`;
          cached = localStorage.getItem(cacheKey);
        }
        if (!cached && binanceSymbol) {
          cacheKey = `binance_pred_${binanceSymbol}_30d`;
          cached = localStorage.getItem(cacheKey);
        }
        if (cached) {
          try {
            const { data } = JSON.parse(cached);
            setHistory(data.prices.map(([timestamp, price]) => ({
              date: new Date(timestamp).toLocaleDateString(),
              price,
            })));
            setWarning('No live data. Showing last available data.');
            setLoading(false);
            return;
          } catch {}
        }
        // No cached data, show placeholder
        setHistory([{ date: 'N/A', price: 0 }]);
        setWarning('No data available for this chart.');
        setLoading(false);
      });
  }, [coin]);

  let chartData = null;
  let chartOptions = null;
  if (history.length > 0) {
    const prices = history.map((h) => h.price);
    const labels = history.map((h) => h.date);
    let prediction = [];
    let predLabels = [];
    if (predictionType === 'trend') {
      prediction = linearRegression(prices);
      predLabels = labels;
    } else {
      prediction = funPrediction(prices);
      predLabels = [labels[labels.length - 1], ...Array.from({ length: 7 }, (_, i) => `+${i + 1}d`)];
    }
    chartData = {
      labels: predictionType === 'trend' ? labels : predLabels,
      datasets: [
        {
          label: 'Historical Price',
          data: prices,
          borderColor: '#6b7280',
          backgroundColor: 'rgba(107,114,128,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: predictionType === 'trend' ? 'Trend Prediction' : 'Fun Prediction',
          data: prediction,
          borderColor: predictionType === 'trend' ? '#2563eb' : '#fbbf24',
          backgroundColor: predictionType === 'trend' ? 'rgba(37,99,235,0.1)' : 'rgba(251,191,36,0.1)',
          borderDash: predictionType === 'trend' ? [6, 6] : [2, 2],
          fill: false,
          tension: 0.3,
          pointRadius: 2,
        },
      ],
    };
    chartOptions = {
      responsive: true,
      plugins: {
        legend: { display: true },
        title: {
          display: true,
          text: `${COINS.find((c) => c.id === coin)?.name || ''} Price Prediction`,
          font: { size: 16 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `$${ctx.parsed.y.toFixed(2)}`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Date' },
        },
        y: {
          title: { display: true, text: 'USD' },
          beginAtZero: false,
        },
      },
    };
  }

  return (
    <div className="predictions-root">
      <section className="predictions-section">
        <h2 className="predictions-title">🔮 Price Predictions</h2>
        <div className="monitor-card predictions-card">
          <div className="monitor-header">
            <span className="monitor-title">Prediction Chart</span>
          </div>
          <div className="monitor-info">
            <label style={{ fontWeight: 600 }}>
              Select Coin:{' '}
              <select value={coin} onChange={e => setCoin(e.target.value)} style={{ marginRight: 16 }}>
                {COINS.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label style={{ fontWeight: 600 }}>
              Prediction Type:{' '}
              <select value={predictionType} onChange={e => setPredictionType(e.target.value)}>
                <option value="trend">Trend (Linear Regression)</option>
                <option value="fun">Fun/Random</option>
              </select>
            </label>
            <div style={{ margin: '1.5rem 0' }}>
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <span>Loading price history...</span>
                </div>
              ) : error ? (
                <div className="error-container">{error}</div>
              ) : history.length === 0 ? (
                <div className="empty-state">No price history available for this coin.</div>
              ) : (
                <>
                  {warning && <div className="warning-container" style={{ color: '#eab308', marginBottom: 8 }}>{warning}</div>}
                  <Line data={chartData} options={chartOptions} />
                </>
              )}
            </div>
          </div>
        </div>
        <div className="predictions-disclaimer">
          Disclaimer: This prediction is for entertainment only and not financial advice.
        </div>
      </section>
    </div>
  );
};

export default PricePredictions; 