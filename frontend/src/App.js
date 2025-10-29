import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ArtworkProvider } from './context/ArtworkContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ArtworkDetail from './pages/ArtworkDetail';
import ArtistDashboard from './pages/ArtistDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import './App.css';
import CartPage from './pages/CartPage';
import PaymentPage from "./pages/PaymentPage";

function App() {
  return (
    <ArtworkProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/artwork/:id" element={<ArtworkDetail />} />
              <Route path="/dashboard" element={<ArtistDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/payment" element={<PaymentPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ArtworkProvider>
  );
}

export default App;