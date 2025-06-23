import React, { useState } from 'react';
import WalletConnect from './WalletConnect';
import WalletConnectProvider from './WalletConnectProvider';
import TokenList from './TokenList';
import { ethers } from 'ethers';


function WalletApp() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [walletType, setWalletType] = useState('metamask'); // 'metamask' or 'walletconnect'

  const handleWalletConnected = (account, providerInstance) => {
    setAccount(account);
    setProvider(providerInstance);
  };

  const handleWalletDisconnected = () => {
    setAccount(null);
    setProvider(null);
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-indigo-700">ETH Balance Hub</h1>
        <div className="flex justify-center mb-6 space-x-4">
          <button
            className={`px-4 py-2 rounded ${
              walletType === 'metamask' ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-700'
            }`}
            onClick={() => setWalletType('metamask')}
          >
            MetaMask
          </button>
          <button
            className={`px-4 py-2 rounded ${
              walletType === 'walletconnect' ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-700'
            }`}
            onClick={() => setWalletType('walletconnect')}
          >
            WalletConnect
          </button>
        </div>
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
        {account && <TokenList provider={provider} account={account} />}
      </div>
    </div>
  );
}

export default WalletApp;
