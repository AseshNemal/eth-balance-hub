// App.js
import './App.css';
import { Routes, Route } from 'react-router-dom';
import WalletApp from './components/WalletApp';
import Header from './components/Header';
import PopularCrypto from './components/PopularCrypto';
import HomePage from './components/HomePage';
import AboutPage from './components/About';
import Footer from './components/Footer';
import PricePredictions from './components/PricePredictions';

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wallet" element={<WalletApp />} />
        <Route path="/tokens" element={<PopularCrypto />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/predictions" element={<PricePredictions />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
