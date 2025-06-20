import React, { useState, useEffect } from 'react';

const WalletConnect = ({ onWalletConnected }) => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install it to use this app.');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      onWalletConnected(accounts[0]);
      setError(null);
    } catch (err) {
      setError('Failed to connect wallet: ' + err.message);
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
    <div className="p-4 border rounded-md shadow-md bg-white">
      {account ? (
        <div>
          <p className="text-green-600 font-semibold">Connected: {account}</p>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Connect MetaMask
        </button>
      )}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default WalletConnect;
