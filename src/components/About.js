import React from 'react';
import './About.css';

const AboutPage = () => {
  return (
    <div className="about-root">
      {/* Hero Section */}
      <div className="about-hero">
        <h1 className="about-title">About ETH Balance Hub</h1>
        <p className="about-subtitle">
          Empowering you to track and manage your Ethereum-based tokens with clarity and precision.
        </p>
      </div>

      {/* Main Content */}
      <div className="about-content">
        <section className="about-section">
          <h2 className="about-section-title">Our Mission</h2>
          <p className="about-section-text">
            ETH Balance Hub aims to simplify the way you monitor your Ethereum wallet. From real-time token prices to portfolio visualization,
            our mission is to make decentralized asset management as seamless as possible.
          </p>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">Our Vision</h2>
          <p className="about-section-text">
            We envision a future where every crypto holder—novice or expert—has full control over their assets, 
            with zero technical barriers and complete transparency.
          </p>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">Why ETH Balance Hub?</h2>
          <ul className="about-bullet-list">
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

export default AboutPage;
