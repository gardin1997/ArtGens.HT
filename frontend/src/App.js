import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ArtworkProvider, useArtwork } from './context/ArtworkContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ArtworkDetail from './pages/ArtworkDetail';
import ArtistDashboard from './pages/ArtistDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import './App.css';

// ✅ Redirection si utilisateur non connecté
function PrivateRoute({ element }) {
  const { user } = useArtwork();
  return user ? element : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ArtworkProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              {/* 🌍 Pages publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/artwork/:id" element={<ArtworkDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* 🔐 Pages protégées */}
              <Route
                path="/dashboard"
                element={<PrivateRoute element={<ArtistDashboard />} />}
              />
              <Route
                path="/profile"
                element={<PrivateRoute element={<Profile />} />}
              />
              <Route
                path="/cart"
                element={<PrivateRoute element={<CartPage />} />}
              />
              <Route
                path="/payment"
                element={<PrivateRoute element={<PaymentPage />} />}
              />

              {/* 🚫 Route inconnue → redirection */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ArtworkProvider>
  );
}

export default App;
