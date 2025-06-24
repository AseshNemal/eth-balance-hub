import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="footer-root">
    <div className="footer-content">
      <span className="footer-copyright">
        &copy; {new Date().getFullYear()} EthBalanceHub. All rights reserved.
      </span>
      <a
        className="footer-link"
        href="https://github.com/aseshnemal/EthBalanceHub"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="footer-github-icon" aria-hidden="true">🐙</span>
        GitHub
      </a>
    </div>
  </footer>
);

export default Footer; 