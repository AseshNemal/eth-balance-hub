import React, { useEffect, useState } from 'react';

const ETHERSCAN_API_KEY = 'YourApiKeyToken'; // Replace with your Etherscan API key

const GasPriceTracker = () => {
  const [gas, setGas] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchGas = async () => {
      setStatus('loading');
      setError(null);
      try {
        const res = await fetch(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        if (isMounted && data.status === '1') {
          setGas({
            low: data.result.SafeGasPrice,
            average: data.result.ProposeGasPrice,
            fast: data.result.FastGasPrice,
          });
          setLastUpdated(new Date().toLocaleTimeString());
          setStatus('ok');
        } else if (isMounted) {
          setStatus('error');
          setError('Failed to fetch gas price from Etherscan');
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setError('Failed to fetch gas price');
        }
      }
    };
    fetchGas();
    const interval = setInterval(fetchGas, 30000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  let indicatorColor = '#fbbf24';
  if (status === 'ok') indicatorColor = '#34d399';
  else if (status === 'error') indicatorColor = '#f87171';

  return (
    <div className="monitor-card">
      <div className="monitor-header">
        <span className="monitor-title">Gas Price</span>
        <span className="monitor-indicator" style={{ background: indicatorColor }}></span>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {gas ? (
        <div className="monitor-info">
          <div>Low: <b>{gas.low} Gwei</b></div>
          <div>Average: <b>{gas.average} Gwei</b></div>
          <div>Fast: <b>{gas.fast} Gwei</b></div>
          <div className="monitor-timestamp">Updated: {lastUpdated}</div>
        </div>
      ) : status === 'loading' ? (
        <div className="monitor-info">Loading...</div>
      ) : (
        <div className="monitor-info">Error fetching gas price</div>
      )}
    </div>
  );
};

export default GasPriceTracker; 