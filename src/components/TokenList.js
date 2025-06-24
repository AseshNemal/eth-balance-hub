import React, { useEffect, useState } from 'react';
import { Contract, formatUnits } from 'ethers';
import TokenChart from './TokenChart';
import { motion, AnimatePresence } from 'framer-motion';
import './TokenList.css';
import { fetchWithCache } from '../utils/fetchWithCache';
import { fetchWithMultiBackup } from '../utils/fetchWithBackup';

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

const DEFAULT_TOKENS = [
  {
    symbol: 'USDT',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    coingeckoId: 'tether',
    icon: '💵'
  },
  {
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    coingeckoId: 'usd-coin',
    icon: '🪙'
  },
  {
    symbol: 'DAI',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    coingeckoId: 'dai',
    icon: '🏦'
  }
];

// Predefined popular tokens for quick add
const PREDEFINED_TOKENS = [
  {
    symbol: 'UNI',
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    coingeckoId: 'uniswap',
    icon: '🦄'
  },
  {
    symbol: 'LINK',
    address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    coingeckoId: 'chainlink',
    icon: '🔗'
  },
  {
    symbol: 'AAVE',
    address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    coingeckoId: 'aave',
    icon: '👻'
  },
  {
    symbol: 'MKR',
    address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    coingeckoId: 'maker',
    icon: '🏦'
  },
  {
    symbol: 'SNX',
    address: '0xc011a72400e58ecd99ee497cf89e3775d4bd732f',
    coingeckoId: 'havven',
    icon: '🧊'
  },
  // ...add more as needed
];

const TokenList = ({ provider, account, setBalances: setBalancesProp, setPrices: setPricesProp }) => {
  const [tokenList, setTokenList] = useState(() => {
    try {
      const saved = localStorage.getItem('userTokenList');
      return saved ? JSON.parse(saved) : DEFAULT_TOKENS;
    } catch {
      return DEFAULT_TOKENS;
    }
  });
  const [balances, setBalancesState] = useState([]);
  const [prices, setPricesState] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortKey, setSortKey] = useState('symbol');
  const [sortOrder, setSortOrder] = useState('asc');
  const [savedTokens, setSavedTokens] = useState(() => {
    try {
      const saved = localStorage.getItem('savedTokens');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedToken, setSelectedToken] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [newToken, setNewToken] = useState({ symbol: '', address: '', coingeckoId: '', icon: '' });
  const [addError, setAddError] = useState('');

  useEffect(() => {
    localStorage.setItem('userTokenList', JSON.stringify(tokenList));
  }, [tokenList]);

  const fetchBalances = async () => {
    if (!provider || !account) return;
    setLoading(true);
    setError(null);
    try {
      const newBalances = [];
      for (const token of tokenList) {
        const contract = new Contract(token.address, ERC20_ABI, provider);
        const rawBalance = await contract.balanceOf(account);
        const decimals = await contract.decimals();
        const balance = Number(formatUnits(rawBalance, decimals));
        newBalances.push({ ...token, balance });
      }
      setBalancesState(newBalances);
      if (setBalancesProp) setBalancesProp(newBalances);
    } catch (err) {
      setError('Failed to fetch token balances: ' + err.message);
    }
    setLoading(false);
  };

  const fetchPrices = async () => {
    try {
      const ids = tokenList.map(t => t.coingeckoId).join(',');
      const priceSources = [
        {
          url: `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
          cacheKey: `cg_token_prices_${ids}`,
          type: 'simple_price',
          backupType: 'coingecko',
        },
        {
          url: `https://api.coincap.io/v2/assets`,
          cacheKey: `cc_token_prices_${ids}`,
          type: 'coins',
          backupType: 'coincap',
        },
        {
          url: `https://api.coinpaprika.com/v1/tickers`,
          cacheKey: `cp_token_prices_${ids}`,
          type: 'coins',
          backupType: 'coinpaprika',
        },
      ];
      let data = await fetchWithMultiBackup({ sources: priceSources });
      // If backup API returns array, map to simple price format
      if (Array.isArray(data)) {
        data = data.reduce((acc, coin) => {
          acc[coin.id] = { usd: coin.current_price };
          return acc;
        }, {});
      }
      setPricesState(data);
      if (setPricesProp) setPricesProp(data);
    } catch (err) {
      setError('Failed to fetch token prices: ' + err.message);
    }
  };

  const fetchPriceHistory = async (coingeckoId) => {
    try {
      const chartSources = [
        {
          url: `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=7&interval=daily`,
          cacheKey: `cg_token_history_${coingeckoId}_7d`,
          type: 'market_chart',
          backupType: 'coingecko',
        },
        {
          url: `https://api.coincap.io/v2/assets/${coingeckoId}/history?interval=d1&start=${Date.now() - 7 * 24 * 60 * 60 * 1000}&end=${Date.now()}`,
          cacheKey: `cc_token_history_${coingeckoId}_7d`,
          type: 'market_chart',
          backupType: 'coincap',
        },
        {
          url: `https://api.coinpaprika.com/v1/tickers/${coingeckoId}/historical?start=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}&interval=1d`,
          cacheKey: `cp_token_history_${coingeckoId}_7d`,
          type: 'market_chart',
          backupType: 'coinpaprika',
        },
      ];
      const data = await fetchWithMultiBackup({ sources: chartSources });
      const history = data.prices.map(([timestamp, price]) => ({
        date: new Date(timestamp).toLocaleDateString(),
        price,
      }));
      setPriceHistory(history);
    } catch (err) {
      setError('Failed to fetch price history: ' + err.message);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [tokenList]);

  useEffect(() => {
    fetchBalances();
  }, [provider, account, tokenList]);

  const toggleSaveToken = (symbol) => {
    let updated;
    if (savedTokens.includes(symbol)) {
      updated = savedTokens.filter((s) => s !== symbol);
    } else {
      updated = [...savedTokens, symbol];
    }
    setSavedTokens(updated);
    localStorage.setItem('savedTokens', JSON.stringify(updated));
  };

  const handleAddToken = (e) => {
    e.preventDefault();
    setAddError('');
    if (!newToken.symbol || !newToken.address || !newToken.coingeckoId) {
      setAddError('Symbol, address, and CoinGecko ID are required.');
      return;
    }
    if (tokenList.some(t => t.address.toLowerCase() === newToken.address.toLowerCase())) {
      setAddError('Token already exists.');
      return;
    }
    setTokenList([...tokenList, newToken]);
    setNewToken({ symbol: '', address: '', coingeckoId: '', icon: '' });
  };

  const handleRemoveToken = (address) => {
    setTokenList(tokenList.filter(t => t.address !== address));
  };

  const filteredTokens = balances.filter(
    (token) =>
      token.symbol.toLowerCase().includes(filter.toLowerCase()) ||
      token.balance.toString().includes(filter)
  );

  const sortedTokens = filteredTokens.sort((a, b) => {
    let compare = 0;
    if (sortKey === 'symbol') {
      compare = a.symbol.localeCompare(b.symbol);
    } else if (sortKey === 'balance') {
      compare = a.balance - b.balance;
    }
    return sortOrder === 'asc' ? compare : -compare;
  });

  return (
    <div className="token-list-container">
      <div className="token-list-header">
        <h2 className="token-list-title">Token Balances</h2>
        {/* Quick Add Predefined Tokens */}
        <div className="predefined-tokens" style={{ marginBottom: 8 }}>
          <span style={{ fontWeight: 600, marginRight: 8 }}>Quick Add:</span>
          {PREDEFINED_TOKENS.filter(
            t => !tokenList.some(ut => ut.address.toLowerCase() === t.address.toLowerCase())
          ).map(token => (
            <button
              key={token.symbol}
              onClick={() => setNewToken(token)}
              style={{ margin: '0 4px', padding: '2px 8px', borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer', background: '#f3f4f6' }}
            >
              {token.icon} {token.symbol}
            </button>
          ))}
        </div>
        <form className="add-token-form" onSubmit={handleAddToken} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
          <input
            type="text"
            placeholder="Symbol"
            value={newToken.symbol}
            onChange={e => setNewToken({ ...newToken, symbol: e.target.value })}
            style={{ width: 70 }}
          />
          <input
            type="text"
            placeholder="Address"
            value={newToken.address}
            onChange={e => setNewToken({ ...newToken, address: e.target.value })}
            style={{ width: 220 }}
          />
          <input
            type="text"
            placeholder="CoinGecko ID"
            value={newToken.coingeckoId}
            onChange={e => setNewToken({ ...newToken, coingeckoId: e.target.value })}
            style={{ width: 120 }}
          />
          <input
            type="text"
            placeholder="Icon (emoji)"
            value={newToken.icon}
            onChange={e => setNewToken({ ...newToken, icon: e.target.value })}
            style={{ width: 60 }}
          />
          <button type="submit" className="animated-btn" style={{ padding: '0.5rem 1rem' }}>Add</button>
        </form>
        {addError && <div style={{ color: '#e53e3e', fontSize: 13 }}>{addError}</div>}
        <div className="token-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Filter tokens..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="token-search"
            />
          </div>
          <div className="sort-controls">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="sort-select"
            >
              <option value="symbol">Sort by Symbol</option>
              <option value="balance">Sort by Balance</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="sort-select"
            >
              <option value="asc">↑ Ascending</option>
              <option value="desc">↓ Descending</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading balances...</p>
        </div>
      )}
      
      {error && (
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}
      
      {!loading && sortedTokens.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p className="empty-text">No tokens found or wallet not connected.</p>
        </div>
      )}

      <div className="token-grid">
        <AnimatePresence>
          {sortedTokens.map((token, index) => (
            <motion.div
              key={token.address}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="token-card"
              onClick={() => {
                setSelectedToken(token);
                fetchPriceHistory(token.coingeckoId);
              }}
            >
              <div className="token-header">
                <div className="token-info">
                  <span className="token-icon">{token.icon}</span>
                  <span className="token-symbol">{token.symbol}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveToken(token.symbol);
                  }}
                  className={`save-button ${savedTokens.includes(token.symbol) ? 'saved' : ''}`}
                >
                  {savedTokens.includes(token.symbol) ? '★' : '☆'}
                </button>
              </div>
              
              <div className="token-balance">
                <span className="balance-amount">{token.balance.toFixed(4)}</span>
                <span className="balance-label">Balance</span>
              </div>
              
              <div className="token-value">
                <span className="value-amount">
                  {prices[token.coingeckoId]
                    ? `$${(token.balance * prices[token.coingeckoId].usd).toFixed(2)}`
                    : 'Loading...'}
                </span>
                <span className="value-label">USD Value</span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleRemoveToken(token.address); }}
                className="remove-token-btn"
                style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: '#e53e3e', fontSize: 18, cursor: 'pointer' }}
                title="Remove token"
              >
                🗑️
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {selectedToken && (
        <div className="chart-modal">
          <div className="chart-content">
            <div className="chart-header">
              <h3>{selectedToken.symbol} Price Chart</h3>
              <button 
                onClick={() => setSelectedToken(null)}
                className="close-button"
              >
                ✕
              </button>
            </div>
            <TokenChart tokenSymbol={selectedToken.symbol} priceHistory={priceHistory} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenList;
