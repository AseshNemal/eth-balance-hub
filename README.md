# EthBalanceHub

EthBalanceHub is a robust, modern React web app for tracking your crypto portfolio, token balances, and market data. It provides real-time and historical data for Ethereum and other popular coins, including price predictions, category-based coin lists (NFT, DeFi, Stablecoins, etc.), and powerful fallback mechanisms to ensure data is always available—even if some APIs fail.

---

## 🚀 Features

- **Multi-Source Crypto Data:**
  - Fetches from CoinGecko, CoinCap, CoinPaprika, CryptoCompare, Coinlore, Messari, CoinStats, CoinMarketCap, Nomics, Binance.
  - Automatic fallback to backup APIs if one fails or is rate-limited.
- **Portfolio & Token Management:**
  - View ETH and ERC-20 token balances for your wallet.
  - Add custom tokens (symbol, address, CoinGecko ID, emoji).
  - "Quick Add" for popular tokens.
- **Category-Based Coin Lists:**
  - Browse coins by category (NFT, Stablecoins, DeFi, Smart Contract Platforms, etc.).
  - Always shows only relevant coins, even with backup APIs.
  - Never empty: shows example tokens if all APIs/cache fail.
- **Price Predictions & Charts:**
  - 30-day price history charts for all supported coins.
  - Linear regression and "fun/random" price predictions.
  - Never empty: shows example chart if all APIs/cache fail.
- **Caching & Offline Support:**
  - All API responses cached in localStorage for 10 minutes (configurable).
  - Shows last known data if offline or APIs are down.
- **User Experience:**
  - Clear warnings if showing cached/example data.
  - Retry buttons for failed API calls.
  - Responsive, modern UI.

---

## 🛠️ Setup

1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd EthBalanceHub/eth-balance-hub
   ```
2. **Install dependencies:**
   ```bash
   yarn install
   # or
   npm install
   ```
3. **(Optional) Add API keys:**
   - For CoinMarketCap and Nomics, get free API keys and add them to a `.env` file:
     ```env
     REACT_APP_CMC_API_KEY=your_cmc_key
     REACT_APP_NOMICS_API_KEY=your_nomics_key
     ```
   - Restart your dev server after adding keys.
4. **Start the app:**
   ```bash
   yarn start
   # or
   npm start
   ```

---

## 🔑 API Keys

- **CoinMarketCap:** [Get a free API key](https://coinmarketcap.com/api/)
- **Nomics:** [Get a free API key](https://nomics.com/)
- Add your keys to `.env` as shown above.
- Most other APIs do not require a key.

---

## 💡 Usage

- **Connect your Ethereum wallet** to view balances.
- **Add tokens** manually or use "Quick Add" for popular tokens.
- **Browse categories** (NFT, DeFi, Stablecoins, etc.) to see top coins and charts.
- **View price predictions** and historical charts for any supported coin.
- **Retry** if you see a warning about failed data—app will try all backup APIs.
- **See warnings** if you're viewing cached or example data.

---

## ➕ Adding Coins or Categories

- **To add more coins to a category:**
  - Edit `CATEGORY_COIN_IDS` in `src/components/PopularCrypto.js` and add CoinGecko IDs.
- **To add more backup APIs:**
  - Add to the `coinsSources` or `chartSources` arrays in the relevant component.
  - Update normalization logic in `src/utils/fetchWithBackup.js`.

---

## 🧩 Extending the Project

- Add more categories or coins by updating the mappings.
- Add more backup APIs as they become available.
- Integrate more wallet types or blockchains.
- Enhance UI/UX with more analytics, notifications, or features.

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

**Questions or suggestions?** Open an issue or PR!
