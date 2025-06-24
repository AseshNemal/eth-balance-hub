import React, { useEffect, useState } from 'react';

const NetworkHealth = ({ provider }) => {
  const [blockTime, setBlockTime] = useState(null);
  const [pending, setPending] = useState(null);
  const [syncing, setSyncing] = useState(null);

  useEffect(() => {
    if (!provider) return;
    let isMounted = true;
    let lastBlock = null;
    let lastTime = null;
    const fetchHealth = async () => {
      try {
        const block = await provider.getBlock('latest');
        if (lastBlock && lastTime) {
          setBlockTime(((block.timestamp - lastTime) || 0));
        }
        lastBlock = block.number;
        lastTime = block.timestamp;
        const pendingBlock = await provider.getBlock('pending');
        setPending(pendingBlock.transactions.length);
        const sync = await provider.send('eth_syncing', []);
        setSyncing(sync && sync !== false);
      } catch {
        // ignore
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [provider]);

  return (
    <div className="monitor-card">
      <div className="monitor-header">
        <span className="monitor-title">Network Health</span>
      </div>
      <div className="monitor-info">
        <div>Block Time: <b>{blockTime ? blockTime + 's' : '...'}</b></div>
        <div>Pending TXs: <b>{pending !== null ? pending : '...'}</b></div>
        <div>Node Sync: <b style={{ color: syncing ? '#fbbf24' : '#34d399' }}>{syncing === null ? '...' : syncing ? 'Syncing' : 'Synced'}</b></div>
      </div>
    </div>
  );
};

export default NetworkHealth; 