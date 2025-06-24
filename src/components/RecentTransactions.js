import React, { useEffect, useState } from 'react';

const ETHERSCAN_API_KEY = 'YourApiKeyToken'; // Replace with your Etherscan API key

const RecentTransactions = ({ account }) => {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!account) return;
    setLoading(true);
    setError(null);
    fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${account}&sort=desc&apikey=${ETHERSCAN_API_KEY}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === '1') {
          setTxs(data.result.slice(0, 5));
        } else {
          setError('No transactions found');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch transactions');
        setLoading(false);
      });
  }, [account]);

  return (
    <div className="monitor-card">
      <div className="monitor-header">
        <span className="monitor-title">Recent Transactions</span>
      </div>
      <div className="monitor-info">
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: '#f87171' }}>{error}</div>}
        {!loading && !error && txs.length > 0 && (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {txs.map(tx => (
              <li key={tx.hash} style={{ marginBottom: 8 }}>
                <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                  {tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}
                </a>
                <span style={{ marginLeft: 8, color: tx.isError === '0' ? '#34d399' : '#f87171' }}>
                  {tx.isError === '0' ? 'Success' : 'Failed'}
                </span>
                <span style={{ marginLeft: 8, color: '#4b5563' }}>
                  {parseFloat(tx.value) / 1e18} ETH
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions; 