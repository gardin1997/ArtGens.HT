import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useArtwork } from '../context/ArtworkContext';
import {
  Menu,
  Home,
  User,
  ShoppingCart,
  LogOut,
  LogIn,
  Palette,
  UserPlus,
} from 'lucide-react';

// 💡 Meilleure structure : CSS via classes (pour :hover et transitions)
import './Navbar.css';

function Navbar({ onToggleMenu }) {
  const { user, logout } = useArtwork();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* ☰ Bouton menu gauche */}
        <button className="menu-btn" onClick={onToggleMenu}>
          <Menu size={26} />
        </button>

        {/* 🎨 Logo principal */}
        <Link to="/" className="navbar-brand">
          <Palette size={24} className="brand-icon" />
          <span className="brand-text">ArtGens.HT</span>
        </Link>

        {/* 🔗 Liens navigation */}
        <div className="nav-links">
          <Link to="/" className="nav-link">
            <Home size={18} /> Galerie
          </Link>

          {user ? (
            <>
              {user.is_artist && (
                <Link to="/dashboard" className="nav-link">
                  🎨 Tableau
                </Link>
              )}
              <Link to="/profile" className="nav-link">
                <User size={18} /> Profil
              </Link>
              <Link to="/cart" className="nav-link">
                <ShoppingCart size={18} /> Panier
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={18} /> Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <LogIn size={18} /> Connexion
              </Link>
              <Link to="/register" className="register-btn">
                <UserPlus size={18} /> Inscription
              </Link>
              <Link to="/cart" className="nav-link">
                <ShoppingCart size={18} /> Panier
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
