import React from 'react';

const AboutPage = () => {
  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.title}>About ETH Balance Hub</h1>
        <p style={styles.subtitle}>
          Empowering you to track and manage your Ethereum-based tokens with clarity and precision.
        </p>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Our Mission</h2>
          <p style={styles.sectionText}>
            ETH Balance Hub aims to simplify the way you monitor your Ethereum wallet. From real-time token prices to portfolio visualization,
            our mission is to make decentralized asset management as seamless as possible.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Our Vision</h2>
          <p style={styles.sectionText}>
            We envision a future where every crypto holder—novice or expert—has full control over their assets, 
            with zero technical barriers and complete transparency.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Why ETH Balance Hub?</h2>
          <ul style={styles.bulletList}>
            <li>🔐 Non-custodial, secure, and privacy-respecting</li>
            <li>📈 Real-time price and historical charts</li>
            <li>⚡ Built for performance, mobile-friendly</li>
            <li>🌍 Supports multiple token standards and DeFi assets</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: 'Arial, sans-serif',
    color: '#111',
    lineHeight: '1.6',
  },
  hero: {
    backgroundColor: '#0a0a23',
    color: '#fff',
    padding: '80px 20px 60px',
    textAlign: 'center',
  },
  title: {
    fontSize: '38px',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '18px',
    maxWidth: '640px',
    margin: '0 auto',
  },
  content: {
    maxWidth: '960px',
    margin: '40px auto',
    padding: '0 20px',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '24px',
    marginBottom: '12px',
  },
  sectionText: {
    fontSize: '16px',
  },
  bulletList: {
    fontSize: '16px',
    paddingLeft: '20px',
    listStyleType: 'disc',
  },
};

export default AboutPage;
