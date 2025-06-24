import React from 'react';

const PortfolioValue = ({ balances, prices }) => {
  if (!balances || balances.length === 0) return null;
  let total = 0;
  const breakdown = balances.map(token => {
    const usd = prices[token.coingeckoId] ? token.balance * prices[token.coingeckoId].usd : 0;
    total += usd;
    return { ...token, usd };
  });
  return (
    <div className="monitor-card">
      <div className="monitor-header">
        <span className="monitor-title">Portfolio Value</span>
      </div>
      <div className="monitor-info">
        <div style={{ fontSize: '2rem', fontWeight: 700 }}>${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {breakdown.map(token => (
            <li key={token.symbol} style={{ fontSize: '1rem', color: '#4b5563' }}>
              {token.symbol}: ${token.usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PortfolioValue; 