import React, { useEffect, useState } from 'react';
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
import { Line } from 'react-chartjs-2';
import './PopularCrypto.css';
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

const categories = [
  { id: 'decentralized_finance_defi', label: 'DeFi' },
  { id: 'stablecoins', label: 'Stablecoins' },
  { id: 'nft', label: 'NFT' },
  { id: 'smart_contract_platforms', label: 'Smart Contract Platforms' },
];

// Category to coin ID mapping for filtering backup API results
const CATEGORY_COIN_IDS = {
  nft: [
    'decentraland', 'the-sandbox', 'axie-infinity', 'enjincoin', 'flow', 'wax', 'gala', 'immutable-x', 'superrare', 'audius',
    'theta-token', 'chiliz', 'decentral-games', 'alien-worlds', 'splinterlands', 'my-neighbor-alice', 'rari-governance-token',
    'apy-vision', 'ultra', 'origin-protocol', 'ape-coin', 'looksrare', 'blur', 'nftx', 'nft20', 'mobox', 'vulcan-forged',
    'wilder-world', 'star-atlas', 'starlink', 'illuvium', 'gods-unchained', 'ethernity-chain', 'treasure', 'binamon',
    'curate', 'polychain-monsters', 'dogami', 'cryptoblades', 'cryptomines-eternal', 'revv', 'sandclock', 'mintable',
    'mintme-com-coin', 'mintlayer', 'minty-art', 'minty', 'minty-token', 'mintyway', 'mintyverse', 'mintyworld', 'mintyzone'
    // ...add more as needed
  ],
  stablecoins: [
    'tether', 'usd-coin', 'binance-usd', 'dai', 'true-usd', 'pax-dollar', 'gemini-dollar', 'usdd', 'frax', 'neutrino',
    // ...add more stablecoin IDs as needed
  ],
  // Add more categories as needed
};

// Example tokens for fallback if no data is available
const EXAMPLE_TOKENS = {
  stablecoins: [
    { id: 'tether', name: 'Tether', symbol: 'USDT', current_price: 1.00, market_cap: 80000000000 },
    { id: 'usd-coin', name: 'USD Coin', symbol: 'USDC', current_price: 1.00, market_cap: 50000000000 },
    { id: 'dai', name: 'Dai', symbol: 'DAI', current_price: 1.00, market_cap: 5000000000 },
    { id: 'binance-usd', name: 'Binance USD', symbol: 'BUSD', current_price: 1.00, market_cap: 4000000000 },
    // ...add more as needed
  ],
  nft: [
    { id: 'decentraland', name: 'Decentraland', symbol: 'MANA', current_price: 0.5, market_cap: 1000000000 },
    { id: 'the-sandbox', name: 'The Sandbox', symbol: 'SAND', current_price: 0.4, market_cap: 800000000 },
    // ...add more as needed
  ],
  // ...add more categories as needed
};

export default function PopularCrypto() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [coins, setCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loadingCoins, setLoadingCoins] = useState(false);
  const [errorCoins, setErrorCoins] = useState(null);
  const [loadingChart, setLoadingChart] = useState(false);
  const [errorChart, setErrorChart] = useState(null);
  const [retryChart, setRetryChart] = useState(0);
  const [retryCoins, setRetryCoins] = useState(0);
  const [warningCoins, setWarningCoins] = useState(null);
  const [warningChart, setWarningChart] = useState(null);

  // Fetch coins by category
  useEffect(() => {
    setSelectedCoin(null);
    setPriceHistory([]);
    setLoadingCoins(true);
    setErrorCoins(null);
    setWarningCoins(null);
    const coinsSources = [
      {
        url: `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${selectedCategory}&order=market_cap_desc&per_page=10&page=1`,
        cacheKey: `cg_cat_${selectedCategory}`,
        type: 'coins',
        backupType: 'coingecko',
      },
      {
        url: 'https://api.coincap.io/v2/assets',
        cacheKey: `cc_cat_${selectedCategory}`,
        type: 'coins',
        backupType: 'coincap',
      },
      {
        url: 'https://api.coinpaprika.com/v1/tickers',
        cacheKey: `cp_cat_${selectedCategory}`,
        type: 'coins',
        backupType: 'coinpaprika',
      },
      {
        url: 'https://api.coinlore.net/api/tickers/',
        cacheKey: `cl_cat_${selectedCategory}`,
        type: 'coinlore_coins',
        backupType: 'coinlore',
      },
      {
        url: 'https://data.messari.io/api/v1/assets',
        cacheKey: `ms_cat_${selectedCategory}`,
        type: 'messari_coins',
        backupType: 'messari',
      },
      {
        url: 'https://api.coinstats.app/public/v1/coins?skip=0&limit=200',
        cacheKey: `cs_cat_${selectedCategory}`,
        type: 'coinstats_coins',
        backupType: 'coinstats',
      },
      {
        url: 'https://min-api.cryptocompare.com/data/all/coinlist',
        cacheKey: `ccmp_cat_${selectedCategory}`,
        type: 'cryptocompare_coins',
        backupType: 'cryptocompare',
      },
    ];
    fetchWithMultiBackup({ sources: coinsSources, forceRefresh: retryCoins > 0 })
      .then((data) => {
        let filtered = data;
        // For backup APIs that don't support categories, filter by CATEGORY_COIN_IDS
        if (selectedCategory in CATEGORY_COIN_IDS) {
          const ids = CATEGORY_COIN_IDS[selectedCategory];
          filtered = data.filter(coin => ids.includes(coin.id));
        }
        setCoins(filtered);
        if (filtered.length > 0) setSelectedCoin(filtered[0]);
        setLoadingCoins(false);
        if (filtered.length === 0) {
          setWarningCoins('No data available for this category right now.');
        }
      })
      .catch(() => {
        // Try to load last cached data
        let cacheKey = `cg_cat_${selectedCategory}`;
        let cached = localStorage.getItem(cacheKey);
        if (!cached) {
          cacheKey = `cc_cat_${selectedCategory}`;
          cached = localStorage.getItem(cacheKey);
        }
        if (!cached) {
          cacheKey = `cp_cat_${selectedCategory}`;
          cached = localStorage.getItem(cacheKey);
        }
        if (!cached) {
          cacheKey = `cl_cat_${selectedCategory}`;
          cached = localStorage.getItem(cacheKey);
        }
        if (!cached) {
          cacheKey = `ms_cat_${selectedCategory}`;
          cached = localStorage.getItem(cacheKey);
        }
        if (!cached) {
          cacheKey = `cs_cat_${selectedCategory}`;
          cached = localStorage.getItem(cacheKey);
        }
        if (!cached) {
          cacheKey = `ccmp_cat_${selectedCategory}`;
          cached = localStorage.getItem(cacheKey);
        }
        if (cached) {
          try {
            const { data } = JSON.parse(cached);
            let filtered = data;
            if (selectedCategory in CATEGORY_COIN_IDS) {
              const ids = CATEGORY_COIN_IDS[selectedCategory];
              filtered = data.filter(coin => ids.includes(coin.id));
            }
            setCoins(filtered);
            if (filtered.length > 0) setSelectedCoin(filtered[0]);
            setWarningCoins('No live data. Showing last available data.');
            setLoadingCoins(false);
            if (filtered.length === 0) {
              setWarningCoins('No data available for this category right now.');
            }
            return;
          } catch {}
        }
        // No cached data, show example tokens if available
        if (EXAMPLE_TOKENS[selectedCategory]) {
          setCoins(EXAMPLE_TOKENS[selectedCategory]);
          setWarningCoins('No data available for this category. Showing example tokens.');
          setLoadingCoins(false);
          if (EXAMPLE_TOKENS[selectedCategory].length > 0) setSelectedCoin(EXAMPLE_TOKENS[selectedCategory][0]);
          return;
        }
        setCoins([]);
        setWarningCoins('No data available for this category.');
        setLoadingCoins(false);
      });
  }, [selectedCategory, retryCoins]);

  // Fetch price history of selected coin (30 days)
  useEffect(() => {
    if (!selectedCoin) return;
    setLoadingChart(true);
    setErrorChart(null);
    setWarningChart(null);
    const chartSources = [
      {
        url: `https://api.coingecko.com/api/v3/coins/${selectedCoin.id}/market_chart?vs_currency=usd&days=30`,
        cacheKey: `cg_chart_${selectedCoin.id}_30d`,
        type: 'market_chart',
        backupType: 'coingecko',
      },
      {
        url: `https://api.coincap.io/v2/assets/${selectedCoin.id}/history?interval=d1&start=${Date.now() - 30 * 24 * 60 * 60 * 1000}&end=${Date.now()}`,
        cacheKey: `cc_chart_${selectedCoin.id}_30d`,
        type: 'market_chart',
        backupType: 'coincap',
      },
      {
        url: `https://api.coinpaprika.com/v1/tickers/${selectedCoin.id}/historical?start=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}&interval=1d`,
        cacheKey: `cp_chart_${selectedCoin.id}_30d`,
        type: 'market_chart',
        backupType: 'coinpaprika',
      },
    ];
    fetchWithMultiBackup({ sources: chartSources, forceRefresh: retryChart > 0 })
      .then((data) => {
        const prices = data.prices.map(([timestamp, price]) => ({
          date: new Date(timestamp).toLocaleDateString(),
          price,
        }));
        setPriceHistory(prices);
        setLoadingChart(false);
        setErrorChart(null);
      })
      .catch(() => {
        // Try to load last cached data
        let cacheKey = `cg_chart_${selectedCoin.id}_30d`;
        let cached = localStorage.getItem(cacheKey);
        if (!cached) {
          cacheKey = `cc_chart_${selectedCoin.id}_30d`;
          cached = localStorage.getItem(cacheKey);
        }
        if (!cached) {
          cacheKey = `cp_chart_${selectedCoin.id}_30d`;
          cached = localStorage.getItem(cacheKey);
        }
        if (cached) {
          try {
            const { data } = JSON.parse(cached);
            const prices = data.prices.map(([timestamp, price]) => ({
              date: new Date(timestamp).toLocaleDateString(),
              price,
            }));
            setPriceHistory(prices);
            setWarningChart('No live data. Showing last available data.');
            setLoadingChart(false);
            return;
          } catch {}
        }
        // No cached data, show placeholder
        setPriceHistory([{ date: 'N/A', price: 0 }]);
        setWarningChart('No data available for this chart.');
        setLoadingChart(false);
      });
  }, [selectedCoin, retryChart]);

  // Prepare chart data
  const chartData = {
    labels: priceHistory.map((p) => p.date),
    datasets: [
      {
        label: `${selectedCoin ? selectedCoin.symbol.toUpperCase() : ''} Price (USD)`,
        data: priceHistory.map((p) => p.price),
        fill: true,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.2)',
        tension: 0.3,
        pointRadius: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `${selectedCoin ? selectedCoin.name : ''} Price Chart`,
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
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="popular-root">
      <h2 className="popular-title">Popular Cryptocurrencies</h2>

      <label className="popular-label">
        Select Category:{' '}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="popular-select"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </label>

      <div className="popular-coins-section">
        <h3 className="popular-coins-title">
          Coins in {categories.find((c) => c.id === selectedCategory)?.label || ''} Category
        </h3>
        {loadingCoins ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span>Loading coins...</span>
          </div>
        ) : errorCoins ? (
          <div className="error-container" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {errorCoins}
            <button
              className="animated-btn"
              style={{ padding: '0.3rem 1rem', fontSize: 14 }}
              onClick={() => setRetryCoins(c => c + 1)}
              disabled={loadingCoins}
            >
              Retry
            </button>
          </div>
        ) : warningCoins ? (
          <div className="warning-container" style={{ color: '#eab308', marginBottom: 8 }}>{warningCoins}</div>
        ) : coins.length === 0 ? (
          <div className="empty-state">No coins found.</div>
        ) : (
          <ul className="popular-coins-list">
            {coins.map((coin) => (
              <li
                key={coin.id}
                onClick={() => setSelectedCoin(coin)}
                className={`popular-coin-item ${selectedCoin?.id === coin.id ? 'selected' : ''}`}
              >
                {coin.name} ({coin.symbol.toUpperCase()}) - ${coin.current_price.toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedCoin && (
        <div className="popular-chart-section">
          {loadingChart ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span>Loading chart...</span>
            </div>
          ) : errorChart ? (
            <div className="error-container" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>{errorChart}</span>
              <button
                className="animated-btn"
                style={{ padding: '0.3rem 1rem', fontSize: 14 }}
                onClick={() => setRetryChart((c) => c + 1)}
                disabled={loadingChart}
              >
                Retry
              </button>
            </div>
          ) : warningChart ? (
            <div className="warning-container" style={{ color: '#eab308', marginBottom: 8 }}>{warningChart}</div>
          ) : priceHistory.length === 0 || (priceHistory.length === 1 && priceHistory[0].date === 'N/A') ? (
            <>
              <div className="empty-state">No price history available for this coin. Showing example chart.</div>
              <Line data={{
                labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
                datasets: [{
                  label: 'Example Price',
                  data: [1, 1, 1, 1, 1],
                  borderColor: '#6b7280',
                  backgroundColor: 'rgba(107,114,128,0.1)',
                  fill: true,
                  tension: 0.3,
                  pointRadius: 2,
                }],
              }} options={chartOptions} />
            </>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      )}
    </div>
  );
}
