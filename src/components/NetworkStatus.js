import React, { useEffect, useState } from 'react';

const NetworkStatus = ({ provider }) => {
  const [network, setNetwork] = useState(null);
  const [blockNumber, setBlockNumber] = useState(null);
  const [latency, setLatency] = useState(null);
  const [status, setStatus] = useState('disconnected');

  useEffect(() => {
    let isMounted = true;
    if (!provider) {
      setStatus('disconnected');
      setNetwork(null);
      setBlockNumber(null);
      setLatency(null);
      return;
    }
    setStatus('connecting');
    const fetchNetwork = async () => {
      try {
        const start = Date.now();
        const net = await provider.getNetwork();
        const block = await provider.getBlockNumber();
        const ping = Date.now() - start;
        if (isMounted) {
          setNetwork(net);
          setBlockNumber(block);
          setLatency(ping);
          setStatus('connected');
        }
      } catch {
        if (isMounted) setStatus('error');
      }
    };
    fetchNetwork();
    const interval = setInterval(fetchNetwork, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [provider]);

  let indicatorColor = '#f87171'; // red
  if (status === 'connected') indicatorColor = '#34d399'; // green
  else if (status === 'connecting') indicatorColor = '#fbbf24'; // yellow

  return (
    <div className="monitor-card">
      <div className="monitor-header">
        <span className="monitor-title">Network Status</span>
        <span className="monitor-indicator" style={{ background: indicatorColor }}></span>
      </div>
      {network && (
        <div className="monitor-info">
          <div>Network: <b>{network.name} (Chain ID: {network.chainId})</b></div>
          <div>Block: <b>{blockNumber}</b></div>
          <div>Latency: <b>{latency} ms</b></div>
        </div>
      )}
      {status === 'disconnected' && <div className="monitor-info">Not connected</div>}
      {status === 'error' && <div className="monitor-info">Error connecting to network</div>}
    </div>
  );
};

export default NetworkStatus; 