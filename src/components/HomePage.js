import React, { useEffect, useState } from 'react';
import axios from 'axios';

const bgImages = [
  'https://source.unsplash.com/1600x900/?bitcoin'

,
  'https://images.unsplash.com/photo-1611078483597-13e2cf6c74cc?auto=format&fit=crop&w=1500&q=80',
  'https://images.unsplash.com/photo-1610549539287-159b68ab9564?auto=format&fit=crop&w=1500&q=80'
];

const HomePage = () => {
  const [coins, setCoins] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, []);

  // Rotate background every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.page}>
      {/* Hero Section with Background Slider */}
      <div
        style={{
          ...styles.hero,
          backgroundImage: `url(${bgImages[currentImage]})`,
        }}
      >
        <div style={styles.overlay}>
          <h1 style={styles.title}>Welcome to ETH Balance Hub</h1>
          <p style={styles.subtitle}>
            Track your crypto portfolio and stay informed with the latest prices, market caps, and trends.
          </p>
        </div>
      </div>

      {/* Global Stats */}
      {globalStats && (
        <section style={styles.statsSection}>
          <h2 style={styles.sectionTitle}>🌍 Global Crypto Stats</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <strong>Total Cryptos:</strong>
              <p>{globalStats.active_cryptocurrencies.toLocaleString()}</p>
            </div>
            <div style={styles.statBox}>
              <strong>Total Market Cap:</strong>
              <p>${Number(globalStats.total_market_cap.usd).toLocaleString()}</p>
            </div>
            <div style={styles.statBox}>
              <strong>24h Volume:</strong>
              <p>${Number(globalStats.total_volume.usd).toLocaleString()}</p>
            </div>
            <div style={styles.statBox}>
              <strong>BTC Dominance:</strong>
              <p>{globalStats.market_cap_percentage.btc.toFixed(2)}%</p>
            </div>
          </div>
        </section>
      )}

      {/* Top Coins */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>🔥 Top 10 Cryptocurrencies</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>24h</th>
                <th style={styles.th}>Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin, index) => (
                <tr key={coin.id}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>
                    <img
                      src={coin.image}
                      alt={coin.name}
                      width="20"
                      style={{ verticalAlign: 'middle', marginRight: 8 }}
                    />
                    {coin.name} ({coin.symbol.toUpperCase()})
                  </td>
                  <td style={styles.td}>${coin.current_price.toLocaleString()}</td>
                  <td
                    style={{
                      ...styles.td,
                      color: coin.price_change_percentage_24h >= 0 ? 'green' : 'red',
                    }}
                  >
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </td>
                  <td style={styles.td}>${coin.market_cap.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: 'Arial, sans-serif',
    color: '#111',
    lineHeight: 1.6,
  },
  hero: {
    height: '300px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'background-image 1s ease-in-out',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    padding: '40px 20px',
    textAlign: 'center',
    width: '100%',
  },
  title: {
    fontSize: '38px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '18px',
    maxWidth: '640px',
    margin: '0 auto',
  },
  section: {
    maxWidth: '960px',
    margin: '40px auto',
    padding: '0 20px',
  },
  sectionTitle: {
    fontSize: '24px',
    marginBottom: '16px',
  },
  statsSection: {
    maxWidth: '960px',
    margin: '40px auto',
    padding: '0 20px',
  },
  statsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
  },
  statBox: {
    backgroundColor: '#f2f4f6',
    padding: '16px',
    borderRadius: '8px',
    flex: '1 1 200px',
    minWidth: '200px',
    textAlign: 'center',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#f9f9f9',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '2px solid #ccc',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #eee',
  },
};

export default HomePage;
