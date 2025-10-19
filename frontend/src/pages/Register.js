import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useArtwork } from '../context/ArtworkContext';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    is_artist: false,
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useArtwork();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    const { confirmPassword, ...submitData } = formData;
    
    const result = await register(submitData);
    
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
          <h2 style={titleStyle}>Inscription</h2>
          <p style={subtitleStyle}>Rejoignez la communauté ArtGens.HT</p>
          
          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={formStyle}>
            <div className="form-group">
              <label style={labelStyle}>Nom d'utilisateur</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="Votre nom d'utilisateur"
              />
            </div>
            
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
                placeholder="Au moins 6 caractères"
              />
            </div>
            
            <div className="form-group">
              <label style={labelStyle}>Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="Répétez votre mot de passe"
              />
            </div>
            
            <div className="form-group" style={checkboxGroupStyle}>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  name="is_artist"
                  checked={formData.is_artist}
                  onChange={handleChange}
                  style={checkboxStyle}
                />
                Je suis un artiste et je souhaite vendre mes œuvres
              </label>
            </div>
            
            {formData.is_artist && (
              <div className="form-group">
                <label style={labelStyle}>Biographie (optionnel)</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Parlez-nous de vous et de votre art..."
                  rows="4"
                />
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              style={submitButtonStyle}
            >
              {loading ? 'Inscription...' : 'Créer mon compte'}
            </button>
          </form>
          
          <div style={linkContainerStyle}>
            <p>
              Déjà un compte ?{' '}
              <Link to="/login" style={linkStyle}>
                Se connecter
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
  maxWidth: '500px'
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

const checkboxGroupStyle = {
  margin: '1.5rem 0'
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  fontSize: '0.9rem'
};

const checkboxStyle = {
  marginRight: '0.5rem'
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

export default Register;