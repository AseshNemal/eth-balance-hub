import React, { useState } from 'react';
import WalletConnect from './WalletConnect';
import WalletConnectProvider from './WalletConnectProvider';
import TokenList from './TokenList';
import { ethers } from 'ethers';
import MonitorPanel from './MonitorPanel';
import './WalletApp.css';
import './MonitorPanel.css';

function WalletApp() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [walletType, setWalletType] = useState('metamask'); // 'metamask' or 'walletconnect'
  const [balances, setBalances] = useState([]);
  const [prices, setPrices] = useState({});

  const handleWalletConnected = (account, providerInstance) => {
    setAccount(account);
    setProvider(providerInstance);
  };

  const handleWalletDisconnected = () => {
    setAccount(null);
    setProvider(null);
  };

  return (
    <div className="wallet-app">
      <div className="wallet-container">
        <h1 className="wallet-title">ETH Balance Hub</h1>
        <div className="wallet-tabs">
          <button
            className={`wallet-tab ${walletType === 'metamask' ? 'active' : ''}`}
            onClick={() => setWalletType('metamask')}
          >
            <span className="tab-icon">🦊</span>
            MetaMask
          </button>
          <button
            className={`wallet-tab ${walletType === 'walletconnect' ? 'active' : ''}`}
            onClick={() => setWalletType('walletconnect')}
          >
            <span className="tab-icon">🔗</span>
            WalletConnect
          </button>
        </div>
        <div className="wallet-content">
        {walletType === 'metamask' && (
          <WalletConnect onWalletConnected={(account) => {
            if (account) {
              const newProvider = new ethers.BrowserProvider(window.ethereum);
              handleWalletConnected(account, newProvider);
            } else {
              handleWalletDisconnected();
            }
          }} />
        )}
        {walletType === 'walletconnect' && (
          <WalletConnectProvider onConnect={handleWalletConnected} onDisconnect={handleWalletDisconnected} />
        )}
        </div>
        <MonitorPanel provider={provider} account={account} balances={balances} prices={prices} />
        {account && (
          <div className="token-section">
            <TokenList provider={provider} account={account} setBalances={setBalances} setPrices={setPrices} />
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletApp;
