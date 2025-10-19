import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useArtwork } from '../context/ArtworkContext';

function Navbar() {
  const { user, logout } = useArtwork();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={navbarStyle}>
      <div style={navContainerStyle}>
        <Link to="/" style={brandStyle}>
          <span style={brandTextStyle}>ArtGens.HT</span>
        </Link>
        
        <div style={navLinksStyle}>
          <Link to="/" style={linkStyle}>Galerie</Link>
          
          {user ? (
            <>
              {user.is_artist && (
                <Link to="/dashboard" style={linkStyle}>Tableau de Bord</Link>
              )}
              <Link to="/profile" style={linkStyle}>Profil</Link>
              <button onClick={handleLogout} style={logoutButtonStyle}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={linkStyle}>Connexion</Link>
              <Link to="/register" style={registerButtonStyle}>
                Inscription
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
  width: '100%',
  backgroundColor: '#00209f',
  color: 'white',
  padding: '0',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  zIndex: 1000
};

const navContainerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '70px'
};

const brandStyle = {
  textDecoration: 'none',
  color: 'white'
};

const brandTextStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold'
};

const navLinksStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '2rem'
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontSize: '1rem',
  transition: 'color 0.3s ease'
};

const registerButtonStyle = {
  padding: '0.5rem 1.5rem',
  backgroundColor: '#d21010',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1rem'
};

const logoutButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: 'transparent',
  color: 'white',
  border: '1px solid white',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1rem'
};

export default Navbar;