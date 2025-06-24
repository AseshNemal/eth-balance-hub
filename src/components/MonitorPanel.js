import React from 'react';
import NetworkStatus from './NetworkStatus';
import GasPriceTracker from './GasPriceTracker';
import EthPriceWidget from './EthPriceWidget';
import PortfolioValue from './PortfolioValue';
import RecentTransactions from './RecentTransactions';
import NetworkHealth from './NetworkHealth';

const MonitorPanel = ({ provider, account, balances, prices }) => (
  <div className="monitor-panel-grid">
    <NetworkStatus provider={provider} />
    <GasPriceTracker />
    <EthPriceWidget />
    <PortfolioValue balances={balances} prices={prices} />
    <RecentTransactions account={account} />
    <NetworkHealth provider={provider} />
  </div>
);

export default MonitorPanel; 