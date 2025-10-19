import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useArtwork } from '../context/ArtworkContext';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useArtwork();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>Connexion</h2>
          <p style={subtitleStyle}>Accédez à votre compte ArtGens.HT</p>
          
          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={formStyle}>
            <div className="form-group">
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="votre@email.com"
              />
            </div>
            
            <div className="form-group">
              <label style={labelStyle}>Mot de passe</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="Votre mot de passe"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={submitButtonStyle}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          
          <div style={linkContainerStyle}>
            <p>
              Pas de compte ?{' '}
              <Link to="/register" style={linkStyle}>
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  minHeight: 'calc(100vh - 70px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem'
};

const formContainerStyle = {
  width: '100%',
  maxWidth: '400px'
};

const cardStyle = {
  backgroundColor: 'white',
  padding: '3rem',
  borderRadius: '10px',
  boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)'
};

const titleStyle = {
  textAlign: 'center',
  color: '#00209f',
  marginBottom: '0.5rem',
  fontSize: '2rem'
};

const subtitleStyle = {
  textAlign: 'center',
  color: '#666',
  marginBottom: '2rem'
};

const formStyle = {
  width: '100%'
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: '500',
  color: '#333'
};

const submitButtonStyle = {
  width: '100%',
  padding: '1rem',
  backgroundColor: '#00209f',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1.1rem',
  marginTop: '1rem'
};

const errorStyle = {
  backgroundColor: '#ffe6e6',
  color: '#d21010',
  padding: '1rem',
  borderRadius: '5px',
  marginBottom: '1rem',
  border: '1px solid #ffb3b3'
};

const linkContainerStyle = {
  textAlign: 'center',
  marginTop: '2rem',
  paddingTop: '1rem',
  borderTop: '1px solid #eee'
};

const linkStyle = {
  color: '#00209f',
  textDecoration: 'none',
  fontWeight: '500'
};

export default Login;