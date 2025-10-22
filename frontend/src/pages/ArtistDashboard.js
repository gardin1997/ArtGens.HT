import React, { useState, useEffect } from 'react';
import { useArtwork } from '../context/ArtworkContext';
import { useNavigate } from 'react-router-dom';

function ArtistDashboard() {
  const { user, addArtwork, fetchArtworks, artworks } = useArtwork();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [artistArtworks, setArtistArtworks] = useState([]);

  // Rediriger si l'utilisateur n'est pas artiste
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!user.is_artist) {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Filtrer les œuvres de l'artiste connecté
  useEffect(() => {
  if (user && artworks) {
    const myArtworks = (artworks || []).filter(artwork => artwork.artist_id === user.id);
    setArtistArtworks(myArtworks);
  }
}, [artworks, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await addArtwork({
        title: formData.title,
        price: parseFloat(formData.price),
        description: formData.description,
        image_url: formData.image_url
      });

      if (result.success) {
        setMessage('Œuvre ajoutée avec succès !');
        setFormData({
          title: '',
          price: '',
          description: '',
          image_url: ''
        });
        // Recharger les œuvres
        fetchArtworks();
      } else {
        setMessage('Erreur: ' + result.error);
      }
    } catch (error) {
      setMessage('Erreur lors de l\'ajout');
    }
    
    setLoading(false);
  };

  if (!user || !user.is_artist) {
    return (
      <div style={containerStyle}>
        <div style={unauthorizedStyle}>
          <h2>Accès non autorisé</h2>
          <p>Vous devez être un artiste pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  // Calculer les statistiques
  const stats = {
    total: artistArtworks.length,
    available: artistArtworks.filter(art => art.is_available).length,
    sold: artistArtworks.filter(art => !art.is_available).length,
    totalRevenue: artistArtworks
      .filter(art => !art.is_available)
      .reduce((sum, art) => sum + art.price, 0)
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Tableau de Bord Artiste</h1>
        <p style={welcomeStyle}>Bienvenue, {user.username} !</p>
      </div>

      {/* Statistiques */}
      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <h3 style={statNumberStyle}>{stats.total}</h3>
          <p style={statLabelStyle}>Œuvres totales</p>
        </div>
        <div style={statCardStyle}>
          <h3 style={statNumberStyle}>{stats.available}</h3>
          <p style={statLabelStyle}>En vente</p>
        </div>
        <div style={statCardStyle}>
          <h3 style={statNumberStyle}>{stats.sold}</h3>
          <p style={statLabelStyle}>Vendues</p>
        </div>
        <div style={statCardStyle}>
          <h3 style={statNumberStyle}>${stats.totalRevenue}</h3>
          <p style={statLabelStyle}>Revenus totaux</p>
        </div>
      </div>

      <div style={dashboardGridStyle}>
        {/* Formulaire d'ajout */}
        <div style={formSectionStyle}>
          <h2 style={sectionTitleStyle}>Nouvelle œuvre</h2>
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Titre *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Titre de votre œuvre"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Prix ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                style={inputStyle}
                placeholder="Prix en dollars"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={textareaStyle}
                placeholder="Décrivez votre œuvre..."
                rows="4"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>URL de l'image *</label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {message && (
              <div style={messageStyle}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={submitButtonStyle}
            >
              {loading ? 'Ajout en cours...' : 'Ajouter l\'œuvre'}
            </button>
          </form>
        </div>

        {/* Liste des œuvres existantes */}
        <div style={artworksSectionStyle}>
          <h2 style={sectionTitleStyle}>Vos œuvres ({artistArtworks.length})</h2>
          
          {artistArtworks.length === 0 ? (
            <div style={emptyStateStyle}>
              <p>Vous n'avez pas encore ajouté d'œuvres.</p>
              <p>Utilisez le formulaire pour ajouter votre première œuvre !</p>
            </div>
          ) : (
            <div style={artworksListStyle}>
              {artistArtworks.map(artwork => (
                <div key={artwork.id} style={artworkItemStyle}>
                  <img 
                    src={artwork.image_url} 
                    alt={artwork.title}
                    style={artworkImageStyle}
                  />
                  <div style={artworkInfoStyle}>
                    <h4 style={artworkTitleStyle}>{artwork.title}</h4>
                    <p style={artworkPriceStyle}>${artwork.price}</p>
                    <p style={artworkStatusStyle(artwork.is_available)}>
                      {artwork.is_available ? '🟢 En vente' : '🔴 Vendue'}
                    </p>
                    <p style={artworkLikesStyle}>
                      ❤️ {artwork.likes_count || 0} likes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  minHeight: '100vh',
  padding: '90px 20px 20px 20px',
  backgroundColor: '#f8f9fa'
};

const unauthorizedStyle = {
  textAlign: 'center',
  padding: '40px',
  backgroundColor: 'white',
  borderRadius: '8px',
  maxWidth: '500px',
  margin: '50px auto'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '30px'
};

const titleStyle = {
  fontSize: '2.5rem',
  color: '#00209f',
  marginBottom: '10px'
};

const welcomeStyle = {
  fontSize: '1.1rem',
  color: '#666'
};

const statsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '20px',
  marginBottom: '40px'
};

const statCardStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  textAlign: 'center',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
};

const statNumberStyle = {
  fontSize: '2rem',
  color: '#00209f',
  margin: '0 0 10px 0'
};

const statLabelStyle = {
  color: '#666',
  margin: '0',
  fontSize: '0.9rem'
};

const dashboardGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '40px',
  maxWidth: '1200px',
  margin: '0 auto'
};

const formSectionStyle = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
};

const artworksSectionStyle = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  maxHeight: '600px',
  overflowY: 'auto'
};

const sectionTitleStyle = {
  fontSize: '1.5rem',
  color: '#333',
  marginBottom: '20px',
  borderBottom: '2px solid #00209f',
  paddingBottom: '10px'
};

const formStyle = {
  width: '100%'
};

const formGroupStyle = {
  marginBottom: '20px'
};

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: '600',
  color: '#333'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '1rem',
  boxSizing: 'border-box'
};

const textareaStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '1rem',
  boxSizing: 'border-box',
  resize: 'vertical',
  fontFamily: 'inherit'
};

const submitButtonStyle = {
  width: '100%',
  padding: '15px',
  backgroundColor: '#00209f',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '1.1rem',
  fontWeight: '600'
};

const messageStyle = {
  padding: '12px',
  borderRadius: '4px',
  marginBottom: '20px',
  textAlign: 'center'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#666'
};

const artworksListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
};

const artworkItemStyle = {
  display: 'flex',
  gap: '15px',
  padding: '15px',
  border: '1px solid #eee',
  borderRadius: '4px',
  alignItems: 'center'
};

const artworkImageStyle = {
  width: '80px',
  height: '80px',
  objectFit: 'cover',
  borderRadius: '4px'
};

const artworkInfoStyle = {
  flex: 1
};

const artworkTitleStyle = {
  margin: '0 0 5px 0',
  fontSize: '1rem',
  color: '#333'
};

const artworkPriceStyle = {
  margin: '0 0 5px 0',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: '#00209f'
};

const artworkStatusStyle = (isAvailable) => ({
  margin: '0 0 5px 0',
  fontSize: '0.9rem',
  color: isAvailable ? '#28a745' : '#dc3545'
});

const artworkLikesStyle = {
  margin: '0',
  fontSize: '0.9rem',
  color: '#666'
};

export default ArtistDashboard;