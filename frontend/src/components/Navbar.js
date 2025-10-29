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
  UserPlus
} from 'lucide-react'; 

function Navbar({ onToggleMenu }) {
  const { user, logout } = useArtwork();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={navbarStyle}>
      <div style={navContainerStyle}>
        {/* ✅ Bouton menu stylisé au coin gauche */}
        <button onClick={onToggleMenu} style={menuButtonStyle}>
          <Menu size={26} />
        </button>

        {/* ✅ Logo principal */}
        <Link to="/" style={brandStyle}>
          <Palette size={24} style={{ marginRight: 8 }} />
          <span style={brandTextStyle}>ArtGens.HT</span>
        </Link>

        {/* ✅ Liens de navigation */}
        <div style={navLinksStyle}>
          <Link to="/" style={linkStyle}>
            <Home size={18} style={{ marginRight: 5 }} /> Galerie
          </Link>

          {user ? (
            <>
              {user.is_artist && (
                <Link to="/dashboard" style={linkStyle}>
                  🎨 Tableau
                </Link>
              )}
              <Link to="/profile" style={linkStyle}>
                <User size={18} style={{ marginRight: 5 }} /> Profil
              </Link>
              <Link to="/cart" style={linkStyle}>
                <ShoppingCart size={18} style={{ marginRight: 5 }} /> Panier
              </Link>
              <button onClick={handleLogout} style={logoutButtonStyle}>
                <LogOut size={18} style={{ marginRight: 5 }} /> Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={linkStyle}>
                <LogIn size={18} style={{ marginRight: 5 }} /> Connexion
              </Link>
              <Link to="/register" style={registerButtonStyle}>
                <UserPlus size={18} style={{ marginRight: 5 }} /> Inscription
              </Link>
              <Link to="/cart" style={linkStyle}>
                <ShoppingCart size={18} style={{ marginRight: 5 }} /> Panier
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}


const navbarStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  backgroundColor: '#00209f',
  color: 'white',
  boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
};

const navContainerStyle = {
  maxWidth: '1300px',
  margin: '0 auto',
  padding: '0 25px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '70px',
  width: '100%',
};


const menuButtonStyle = {
  position: 'absolute',
  left: 0,
  top: 0,
  height: '70px',
  width: '65px',
  backgroundColor: '#001873',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1.5rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'background-color 0.3s ease, transform 0.2s ease',
};
menuButtonStyle[':hover'] = {
  backgroundColor: '#00125a',
  transform: 'scale(1.05)',
};

const brandStyle = {
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1.5rem',
  marginLeft: '80px', 
};

const brandTextStyle = {
  fontSize: '1.5rem',
  fontWeight: 700,
  letterSpacing: '0.5px',
};

const navLinksStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.4rem',
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontSize: '1rem',
  display: 'flex',
  alignItems: 'center',
  transition: 'opacity 0.3s ease',
};
linkStyle[':hover'] = { opacity: 0.8 };

const registerButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '0.5rem 1.2rem',
  backgroundColor: '#e63946',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 500,
  transition: 'background-color 0.3s ease',
};
registerButtonStyle[':hover'] = {
  backgroundColor: '#c1121f',
};

const logoutButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  padding: '0.45rem 1rem',
  backgroundColor: 'transparent',
  color: 'white',
  border: '1px solid white',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
};
logoutButtonStyle[':hover'] = {
  backgroundColor: 'white',
  color: '#00209f',
};

export default Navbar;