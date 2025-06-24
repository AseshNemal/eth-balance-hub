import { color } from 'framer-motion';
import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          <h1 style={styles.logo}>ETH Balance Hub</h1>
          <nav style={styles.nav}>
            <a href="/" style={styles.link}>Home</a>
            <a href="/wallet" style={styles.link}>Wallet</a>
            <a href="/tokens" style={styles.link}>Tokens</a>
            <a href="/about" style={styles.link}>About</a>
            <a href="/predictions" style={styles.link}>Predictions</a>
          </nav>
        </div>
      </header>
    </>
  );
};

const styles = {
  header: {
    backgroundColor: '#111827',
    padding: '16px 0',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    letterSpacing: '1px',
    color: 'white',
  },
  nav: {
    display: 'flex',
    gap: '20px',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'color 0.3s ease',
  }
};

export default Header;
