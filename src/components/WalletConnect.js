import React, { useState, useEffect } from 'react';
import './WalletConnect.css';

const WalletConnect = ({ onWalletConnected }) => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install it to use this app.');
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      onWalletConnected(accounts[0]);
      setError(null);
    } catch (err) {
      setError('Failed to connect wallet: ' + err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onWalletConnected(accounts[0]);
        } else {
          setAccount(null);
          onWalletConnected(null);
        }
      });
    }
  }, [onWalletConnected]);

  return (
    <div className="wallet-connect">
      {account ? (
        <div className="wallet-connected">
          <div className="connection-status">
            <div className="status-indicator connected"></div>
            <span className="status-text">Connected</span>
          </div>
          <div className="account-info">
            <span className="account-label">Account:</span>
            <span className="account-address">{account}</span>
          </div>
        </div>
      ) : (
        <div className="wallet-disconnected">
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className={`connect-button ${isConnecting ? 'connecting' : ''}`}
          >
            {isConnecting ? (
              <>
                <div className="spinner"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span className="button-icon">🦊</span>
                <span>Connect MetaMask</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
