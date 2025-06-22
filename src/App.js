
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; 
import WalletApp from './components/WalletApp';
function App() {

  return (
    <Router>
      <Routes>
            <Route path="/" element={< WalletApp/>} />
      </Routes>
    </Router>
  );
}

export default App;
