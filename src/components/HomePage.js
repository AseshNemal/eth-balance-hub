import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HomePage.css';

const bgImages = [
  'https://content.kaspersky-labs.com/fm/press-releases/e0/e0c122e63ca4199bb2f758617abad50b/source/cryptocurrencyimage11130490519670x377px300dpi.jpg',
  'https://builtin.com/sites/www.builtin.com/files/styles/ckeditor_optimize/public/inline-images/inside-crypto-cryptocurrency.png',
  'https://d3i6fh83elv35t.cloudfront.net/static/2022/06/cryptoplunge-1200x789.jpg'
];

const HomePage = () => {
  const [coins, setCoins] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [fade, setFade] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const fetchData = async () => {
    setRetrying(true);
    setLoading(true);
    try {
      const [coinsRes, statsRes] = await Promise.all([
        axios.get('https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 10,
            page: 1,
            sparkline: false,
          },
        }),
        axios.get('https://api.coingecko.com/api/v3/global'),
      ]);
      setCoins(coinsRes.data);
      setGlobalStats(statsRes.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
    setRetrying(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentImage((prev) => (prev + 1) % bgImages.length);
        setFade(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="homepage-root">
      {/* Hero Section */}
      <div
        className={`homepage-hero ${fade ? 'fade-in' : 'fade-out'}`}
        style={{ backgroundImage: `url(${bgImages[currentImage]})` }}
      >
        <div className="homepage-overlay">
          <h1 className="homepage-title">Welcome to ETH Balance Hub</h1>
          <p className="homepage-subtitle">
            Track your crypto portfolio and stay informed with the latest prices, market caps, and trends.
          </p>
        </div>
      </div>

      {/* Global Stats */}
      {globalStats && (
        <section className="homepage-stats-section">
          <h2 className="homepage-section-title">🌍 Global Crypto Stats</h2>
          <div className="homepage-stats-grid">
            {[
              { label: 'Total Cryptos', value: globalStats.active_cryptocurrencies },
              { label: 'Total Market Cap', value: globalStats.total_market_cap.usd, prefix: '$' },
              { label: '24h Volume', value: globalStats.total_volume.usd, prefix: '$' },
              { label: 'BTC Dominance', value: globalStats.market_cap_percentage.btc.toFixed(2), suffix: '%' },
            ].map((stat, idx) => (
              <div key={idx} className="homepage-stat-box fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <strong>{stat.label}</strong>
                <p>
                  {stat.prefix || ''}
                  {Number(stat.value).toLocaleString()}
                  {stat.suffix || ''}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top 10 Cryptocurrencies */}
      <section className="homepage-section">
        <h2 className="homepage-section-title">🔥 Top 10 Cryptocurrencies</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {coins.length < 10 && (
              <div style={{ color: '#e53e3e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>Warning: Some top coins could not be loaded. Please refresh or try again later.</span>
                <button
                  className="animated-btn"
                  style={{ padding: '0.3rem 1rem', fontSize: 14 }}
                  onClick={fetchData}
                  disabled={loading || retrying}
                >
                  {retrying ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            )}
            <table className="homepage-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>24h</th>
                  <th>Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {coins.map((coin, index) => (
                  <tr key={coin.id} className="homepage-table-row fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td>{index + 1}</td>
                    <td>
                      <img
                        src={coin.image}
                        alt={coin.name}
                        width="20"
                        height="20"
                        style={{ verticalAlign: 'middle', marginRight: 8 }}
                      />
                      {coin.name} ({coin.symbol.toUpperCase()})
                    </td>
                    <td>${coin.current_price.toLocaleString()}</td>
                    <td style={{ color: coin.price_change_percentage_24h >= 0 ? 'green' : 'red' }}>
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </td>
                    <td>${coin.market_cap.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      {/* What is Cryptocurrency Section */}
      <section className="homepage-info-section">
        <h2 className="homepage-section-title">💡 What Is Cryptocurrency?</h2>
        <p className="homepage-info-text">
          Cryptocurrency is a digital or virtual form of currency that relies on cryptographic techniques for security.
          It enables peer-to-peer transactions without the need for a central authority like a bank.
          Bitcoin was the first cryptocurrency, introduced in 2009, and many others have since emerged including Ethereum, Litecoin, and more.
        </p>
        <p className="homepage-info-text">
          Unlike traditional currencies, cryptocurrencies operate on decentralized blockchain technology,
          ensuring transparency and immutability of transactions.
          Coins can be mined or purchased and stored in digital wallets.
        </p>
      </section>

      {/* Security Tips Section */}
      <section className="homepage-info-section">
        <h2 className="homepage-section-title">🛡️ Crypto Security Tips</h2>
        <ul className="homepage-info-list">
          <li>Double-check recipient addresses; crypto transactions are irreversible.</li>
          <li>Use hardware wallets or trusted apps with 2FA for safe storage.</li>
          <li>Never share your private keys or recovery phrases.</li>
          <li>Beware of phishing websites or fake apps.</li>
          <li>Avoid accessing your wallet on public Wi-Fi networks.</li>
        </ul>
      </section>
    </div>
  );
};

export default HomePage;
