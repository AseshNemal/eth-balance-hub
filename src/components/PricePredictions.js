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
  const [predictionType, setPredictionType] = useState('trend'); // 'trend' or 'fun'

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=30`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch price history');
        return res.json();
      })
      .then((data) => {
        setHistory(data.prices.map(([timestamp, price]) => ({
          date: new Date(timestamp).toLocaleDateString(),
          price,
        })));
        setLoading(false);
      })
      .catch(() => {
        setHistory([]);
        setError('Failed to fetch price history. Please try again later.');
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
                <Line data={chartData} options={chartOptions} />
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