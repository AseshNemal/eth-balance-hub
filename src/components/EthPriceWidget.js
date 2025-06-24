import React, { useEffect, useState } from 'react';
import { fetchWithMultiBackup } from '../utils/fetchWithBackup';

const EthPriceWidget = () => {
  const [price, setPrice] = useState(null);
  const [change, setChange] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const priceSources = [
          {
            url: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true',
            cacheKey: 'cg_eth_simple',
            type: 'simple_price',
            backupType: 'coingecko',
          },
          {
            url: 'https://api.coincap.io/v2/assets/ethereum',
            cacheKey: 'cc_eth_simple',
            type: 'simple_price',
            backupType: 'coincap',
          },
          {
            url: 'https://api.coinpaprika.com/v1/tickers/eth-ethereum',
            cacheKey: 'cp_eth_simple',
            type: 'simple_price',
            backupType: 'coinpaprika',
          },
        ];
        const data = await fetchWithMultiBackup({ sources: priceSources });
        setPrice(data.ethereum?.usd || data['eth-ethereum']?.usd || Object.values(data)[0]?.usd);
        setChange(data.ethereum?.usd_24h_change || 0);
        setError(null);
      } catch (err) {
        setError('Failed to fetch ETH price');
      }
    };
    const fetchHistory = async () => {
      try {
        const chartSources = [
          {
            url: 'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7',
            cacheKey: 'cg_eth_7d',
            type: 'market_chart',
            backupType: 'coingecko',
          },
          {
            url: `https://api.coincap.io/v2/assets/ethereum/history?interval=d1&start=${Date.now() - 7 * 24 * 60 * 60 * 1000}&end=${Date.now()}`,
            cacheKey: 'cc_eth_7d',
            type: 'market_chart',
            backupType: 'coincap',
          },
          {
            url: `https://api.coinpaprika.com/v1/tickers/eth-ethereum/historical?start=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}&interval=1d`,
            cacheKey: 'cp_eth_7d',
            type: 'market_chart',
            backupType: 'coinpaprika',
          },
        ];
        const data = await fetchWithMultiBackup({ sources: chartSources });
        setHistory(data.prices.map(([t, p]) => p));
        setError(null);
      } catch (err) {
        setError('Failed to fetch ETH price history');
      }
    };
    fetchPrice();
    fetchHistory();
    const interval = setInterval(() => { fetchPrice(); fetchHistory(); }, 60000);
    return () => clearInterval(interval);
  }, []);

  const sparkline = history.length > 0 ? (
    <svg width="100" height="30">
      <polyline
        fill="none"
        stroke="#6b7280"
        strokeWidth="2"
        points={history.map((p, i) => `${(i / (history.length - 1)) * 100},${30 - ((p - Math.min(...history)) / (Math.max(...history) - Math.min(...history) || 1)) * 30}`).join(' ')}
      />
    </svg>
  ) : null;

  return (
    <div className="monitor-card">
      <div className="monitor-header">
        <span className="monitor-title">ETH Price</span>
      </div>
      <div className="monitor-info">
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <div style={{ fontSize: '2rem', fontWeight: 700 }}>${price ? price.toLocaleString() : '...'}</div>
        <div style={{ color: change > 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>
          {change ? (change > 0 ? '+' : '') + change.toFixed(2) + '%' : ''}
        </div>
        <div style={{ marginTop: 8 }}>{sparkline}</div>
      </div>
    </div>
  );
};

export default EthPriceWidget; 