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

  // Fetch coins by category
  useEffect(() => {
    setSelectedCoin(null);
    setPriceHistory([]);
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${selectedCategory}&order=market_cap_desc&per_page=10&page=1`
    )
      .then((res) => res.json())
      .then((data) => {
        setCoins(data);
        if (data.length > 0) setSelectedCoin(data[0]);
      })
      .catch(() => {
        setCoins([]);
      });
  }, [selectedCategory]);

  // Fetch price history of selected coin (30 days)
  useEffect(() => {
    if (!selectedCoin) return;

    fetch(
      `https://api.coingecko.com/api/v3/coins/${selectedCoin.id}/market_chart?vs_currency=usd&days=30`
    )
      .then((res) => res.json())
      .then((data) => {
        const prices = data.prices.map(([timestamp, price]) => ({
          date: new Date(timestamp).toLocaleDateString(),
          price,
        }));
        setPriceHistory(prices);
      })
      .catch(() => {
        setPriceHistory([]);
      });
  }, [selectedCoin]);

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
    <div style={{ maxWidth: 900, margin: 'auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2>Popular Cryptocurrencies</h2>

      <label>
        Select Category:{' '}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: 6, marginBottom: 20, fontSize: 16 }}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </label>

      <div>
        <h3>
          Coins in {categories.find((c) => c.id === selectedCategory)?.label || ''} Category
        </h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {coins.map((coin) => (
            <li
              key={coin.id}
              onClick={() => setSelectedCoin(coin)}
              style={{
                cursor: 'pointer',
                margin: '8px 0',
                fontWeight: selectedCoin?.id === coin.id ? 'bold' : 'normal',
                color: selectedCoin?.id === coin.id ? '#2563eb' : 'inherit',
              }}
            >
              {coin.name} ({coin.symbol.toUpperCase()}) - ${coin.current_price.toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      {selectedCoin && priceHistory.length > 0 && (
        <div>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}
