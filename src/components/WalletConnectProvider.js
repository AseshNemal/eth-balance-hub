import React, { useEffect, useState } from 'react';
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from 'ethers';

const WalletConnectProviderComponent = ({ onConnect, onDisconnect }) => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const initWalletConnect = async () => {
      const wcProvider = new WalletConnectProvider({
        rpc: {
          1: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
          // Add other networks if needed
        },
      });

      await wcProvider.enable();

      const ethersProvider = new ethers.BrowserProvider(wcProvider);
      setProvider(ethersProvider);

      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      if (onConnect) {
        onConnect(address, ethersProvider);
      }

      wcProvider.on("disconnect", () => {
        setProvider(null);
        setAccount(null);
        if (onDisconnect) {
          onDisconnect();
        }
      });
    };

    initWalletConnect().catch(console.error);

    // Cleanup on unmount
    return () => {
      if (provider && provider.provider && provider.provider.disconnect) {
        provider.provider.disconnect();
      }
    };
  }, [onConnect, onDisconnect, provider]);

  return (
    <div>
      {account ? (
        <p>Connected WalletConnect account: {account}</p>
      ) : (
        <p>Connecting WalletConnect...</p>
      )}
    </div>
  );
};

export default WalletConnectProviderComponent;
