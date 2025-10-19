import React from 'react';
import { useArtwork } from '../context/ArtworkContext';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user } = useArtwork();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div style={containerStyle}>
      <div className="container">
        <div style={cardStyle}>
          <div style={headerStyle}>
            <h1>Mon Profil</h1>
          </div>
          
          <div style={profileInfoStyle}>
            <div style={avatarSectionStyle}>
              <div style={avatarStyle}>
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div style={detailsSectionStyle}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Nom d'utilisateur</label>
                <p style={valueStyle}>{user.username}</p>
              </div>
              
              <div style={fieldStyle}>
                <label style={labelStyle}>Email</label>
                <p style={valueStyle}>{user.email}</p>
              </div>
              
              <div style={fieldStyle}>
                <label style={labelStyle}>Type de compte</label>
                <p style={valueStyle}>
                  {user.is_artist ? 'Artiste' : 'Collectionneur'}
                </p>
              </div>
              
              {user.bio && (
                <div style={fieldStyle}>
                  <label style={labelStyle}>Biographie</label>
                  <p style={valueStyle}>{user.bio}</p>
                </div>
              )}
              
              <div style={fieldStyle}>
                <label style={labelStyle}>Membre depuis</label>
                <p style={valueStyle}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Date non disponible'}
                </p>
              </div>
            </div>
          </div>
          
          {user.is_artist && (
            <div style={actionsStyle}>
              <button 
                onClick={() => navigate('/dashboard')}
                style={buttonStyle}
              >
                📊 Accéder au tableau de bord
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const containerStyle = { 
  padding: '2rem 0',
  minHeight: 'calc(100vh - 70px)'
};

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '10px',
  boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  maxWidth: '600px',
  margin: '0 auto'
};

const headerStyle = {
  backgroundColor: '#00209f',
  color: 'white',
  padding: '2rem',
  textAlign: 'center'
};

const profileInfoStyle = {
  padding: '2rem',
  display: 'flex',
  gap: '2rem',
  alignItems: 'flex-start'
};

const avatarSectionStyle = {
  flexShrink: 0
};

const avatarStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: '#00209f',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2rem',
  fontWeight: 'bold'
};

const detailsSectionStyle = {
  flex: 1
};

const fieldStyle = {
  marginBottom: '1.5rem',
  paddingBottom: '1.5rem',
  borderBottom: '1px solid #eee'
};

const labelStyle = {
  display: 'block',
  fontWeight: '600',
  color: '#333',
  marginBottom: '0.5rem',
  fontSize: '0.9rem'
};

const valueStyle = {
  color: '#666',
  fontSize: '1.1rem',
  margin: 0
};

const actionsStyle = {
  padding: '0 2rem 2rem 2rem',
  textAlign: 'center'
};

const buttonStyle = {
  padding: '1rem 2rem',
  backgroundColor: '#00209f',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1rem'
};

export default Profile;