import React, { useEffect, useState } from 'react';
import { Contract, formatUnits } from 'ethers';
import TokenChart from './TokenChart';

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// Example token list with contract addresses on Ethereum mainnet
const TOKEN_LIST = [
  {
    symbol: 'USDT',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    coingeckoId: 'tether'
  },
  {
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    coingeckoId: 'usd-coin'
  },
  {
    symbol: 'DAI',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    coingeckoId: 'dai'
  }
];

const TokenList = ({ provider, account }) => {
  const [balances, setBalances] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortKey, setSortKey] = useState('symbol'); // 'symbol' or 'balance'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
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

  // Fetch token balances from blockchain
  const fetchBalances = async () => {
    if (!provider || !account) return;
    setLoading(true);
    setError(null);
    try {
      const newBalances = [];
      for (const token of TOKEN_LIST) {
        const contract = new Contract(token.address, ERC20_ABI, provider);
        const rawBalance = await contract.balanceOf(account);
        const decimals = await contract.decimals();
        const balance = Number(formatUnits(rawBalance, decimals));
        newBalances.push({ ...token, balance });
      }
      setBalances(newBalances);
    } catch (err) {
      setError('Failed to fetch token balances: ' + err.message);
    }
    setLoading(false);
  };

  // Fetch token prices from CoinGecko API
  const fetchPrices = async () => {
    try {
      const ids = TOKEN_LIST.map(t => t.coingeckoId).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
      );
      const data = await response.json();
      setPrices(data);
    } catch (err) {
      setError('Failed to fetch token prices: ' + err.message);
    }
  };

  // Fetch price history for chart
  const fetchPriceHistory = async (coingeckoId) => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=7&interval=daily`
      );
      const data = await response.json();
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
  }, []);

  useEffect(() => {
    fetchBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, account]);

  // Save tokens to localStorage
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

  // Filter tokens by symbol or balance
  const filteredTokens = balances.filter(
    (token) =>
      token.symbol.toLowerCase().includes(filter.toLowerCase()) ||
      token.balance.toString().includes(filter)
  );

  // Sort tokens based on sortKey and sortOrder
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
    <div className="p-6 bg-white rounded-lg shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Token Balances</h2>
      <div className="flex items-center mb-4 space-x-4">
        <input
          type="text"
          placeholder="Filter tokens by symbol or balance"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="symbol">Sort by Symbol</option>
          <option value="balance">Sort by Balance</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      {loading && <p className="text-gray-600">Loading balances...</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}
      {!loading && sortedTokens.length === 0 && (
        <p className="text-gray-500">No tokens found or wallet not connected.</p>
      )}
      <ul>
        {sortedTokens.map((token) => (
          <li
            key={token.address}
            className="flex justify-between items-center py-3 border-b border-gray-200 cursor-pointer hover:bg-indigo-50 transition"
            onClick={() => {
              setSelectedToken(token);
              fetchPriceHistory(token.coingeckoId);
            }}
          >
            <span className="font-semibold text-gray-700">{token.symbol}</span>
            <span className="text-gray-600">{token.balance.toFixed(4)}</span>
            <span className="text-gray-600">
              {prices[token.coingeckoId]
                ? `$${(token.balance * prices[token.coingeckoId].usd).toFixed(2)}`
                : 'Loading...'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSaveToken(token.symbol);
              }}
              className={`ml-4 px-3 py-1 rounded text-sm font-medium ${
                savedTokens.includes(token.symbol)
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              } transition`}
            >
              {savedTokens.includes(token.symbol) ? 'Saved' : 'Save'}
            </button>
          </li>
        ))}
      </ul>
      {selectedToken && priceHistory.length > 0 && (
        <div className="mt-8 max-w-md h-48">
          <TokenChart tokenSymbol={selectedToken.symbol} priceHistory={priceHistory} />
        </div>
      )}
    </div>
  );
};

export default TokenList;
