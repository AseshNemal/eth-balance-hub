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

  // Fetch coins by category
  useEffect(() => {
    setSelectedCoin(null);
    setPriceHistory([]);
    setLoadingCoins(true);
    setErrorCoins(null);
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${selectedCategory}&order=market_cap_desc&per_page=10&page=1`
    )
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch coins');
        return res.json();
      })
      .then((data) => {
        setCoins(data);
        if (data.length > 0) setSelectedCoin(data[0]);
        setLoadingCoins(false);
      })
      .catch(() => {
        setCoins([]);
        setErrorCoins('Failed to fetch coins. Please try again later.');
        setLoadingCoins(false);
      });
  }, [selectedCategory]);

  // Fetch price history of selected coin (30 days)
  useEffect(() => {
    if (!selectedCoin) return;
    setLoadingChart(true);
    setErrorChart(null);
    fetch(
      `https://api.coingecko.com/api/v3/coins/${selectedCoin.id}/market_chart?vs_currency=usd&days=30`
    )
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch price history');
        return res.json();
      })
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
        setPriceHistory([]);
        setErrorChart('Failed to fetch price history. Please try again later.');
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
          <div className="error-container">{errorCoins}</div>
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
          ) : priceHistory.length === 0 ? (
            <div className="empty-state">No price history available for this coin.</div>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      )}
    </div>
  );
}
