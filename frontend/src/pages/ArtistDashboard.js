import React, { useState, useEffect } from 'react';
import { useArtwork } from '../context/ArtworkContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ArtistDashboard() {
  const { user } = useArtwork();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [stats, setStats] = useState({ 
    total: 0, 
    sold: 0, 
    available: 0, 
    revenue: 0 
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image_url: '',
    categories: []
  });

  useEffect(() => {
    if (!user || !user.is_artist) {
      navigate('/');
      return;
    }
    fetchArtistArtworks();
  }, [user]);

  const fetchArtistArtworks = async () => {
    try {
      const response = await axios.get('http://localhost:5555/api/artist/artworks');
      setArtworks(response.data.artworks);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5555/api/artworks', formData);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        price: '',
        image_url: '',
        categories: []
      });
      await fetchArtistArtworks();
      alert('Œuvre ajoutée avec succès !');
    } catch (error) {
      alert('Erreur lors de l\'ajout: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={spinnerStyle}></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div className="container">
        <header style={headerStyle}>
          <h1>Tableau de Bord Artiste</h1>
          <p>Bienvenue, {user?.username} ! Gérez vos œuvres et suivez vos ventes.</p>
        </header>

        {/* Statistiques */}
        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <h3>Œuvres totales</h3>
            <p style={statNumberStyle}>{stats.total}</p>
          </div>
          <div style={statCardStyle}>
            <h3>En vente</h3>
            <p style={statNumberStyle}>{stats.available}</p>
          </div>
          <div style={statCardStyle}>
            <h3>Vendues</h3>
            <p style={statNumberStyle}>{stats.sold}</p>
          </div>
          <div style={statCardStyle}>
            <h3>Revenus totaux</h3>
            <p style={statNumberStyle}>${stats.revenue}</p>
          </div>
        </div>

        {/* Actions */}
        <div style={actionsStyle}>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={addButtonStyle}
          >
            {showForm ? 'Annuler' : '+ Ajouter une œuvre'}
          </button>
        </div>

        {/* Formulaire d'ajout */}
        {showForm && (
          <div style={formContainerStyle}>
            <h3>Nouvelle œuvre</h3>
            <form onSubmit={handleSubmit} style={formStyle}>
              <div style={formGridStyle}>
                <div className="form-group">
                  <label>Titre</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label>Prix ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="form-control"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>URL de l'image</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <button type="submit" style={submitButtonStyle}>
                Ajouter l'œuvre
              </button>
            </form>
          </div>
        )}

        {/* Liste des œuvres */}
        <div style={artworksSectionStyle}>
          <h3>Mes œuvres</h3>
          {artworks.length === 0 ? (
            <div style={emptyStateStyle}>
              <p>Vous n'avez pas encore d'œuvres en vente.</p>
              <button 
                onClick={() => setShowForm(true)}
                style={addButtonStyle}
              >
                Ajouter votre première œuvre
              </button>
            </div>
          ) : (
            <div style={artworksGridStyle}>
              {artworks.map(artwork => (
                <div key={artwork.id} style={artworkCardStyle}>
                  <img 
                    src={artwork.image_url || '/placeholder-image.jpg'} 
                    alt={artwork.title}
                    style={imageStyle}
                  />
                  <div style={artworkInfoStyle}>
                    <h4>{artwork.title}</h4>
                    <p style={priceStyle}>${artwork.price}</p>
                    <p style={statusStyle(artwork.is_available)}>
                      {artwork.is_available ? 'En vente' : 'Vendu'}
                    </p>
                    <div style={categoriesStyle}>
                      {artwork.categories.map(cat => (
                        <span key={cat} style={categoryTagStyle}>{cat}</span>
                      ))}
                    </div>
                    <p style={likesStyle}>❤️ {artwork.likes_count} likes</p>
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

const containerStyle = { 
  padding: '2rem 0',
  minHeight: 'calc(100vh - 70px)'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '3rem'
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1.5rem',
  marginBottom: '3rem'
};

const statCardStyle = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  textAlign: 'center'
};

const statNumberStyle = {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: '#00209f',
  margin: '0.5rem 0 0 0'
};

const actionsStyle = {
  marginBottom: '2rem',
  textAlign: 'center'
};

const addButtonStyle = {
  padding: '1rem 2rem',
  backgroundColor: '#00209f',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1rem'
};

const formContainerStyle = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  marginBottom: '3rem'
};

const formStyle = {
  width: '100%'
};

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
  marginBottom: '1rem'
};

const submitButtonStyle = {
  padding: '1rem 2rem',
  backgroundColor: '#d21010',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1rem'
};

const artworksSectionStyle = {
  marginTop: '3rem'
};

const artworksGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '2rem'
};

const artworkCardStyle = {
  backgroundColor: 'white',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden'
};

const imageStyle = {
  width: '100%',
  height: '200px',
  objectFit: 'cover'
};

const artworkInfoStyle = {
  padding: '1.5rem'
};

const priceStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#00209f',
  margin: '0.5rem 0'
};

const statusStyle = (isAvailable) => ({
  color: isAvailable ? '#28a745' : '#6c757d',
  fontWeight: 'bold',
  margin: '0.5rem 0'
});

const categoriesStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  margin: '1rem 0'
};

const categoryTagStyle = {
  backgroundColor: '#e9ecef',
  color: '#495057',
  padding: '0.25rem 0.5rem',
  borderRadius: '15px',
  fontSize: '0.8rem'
};

const likesStyle = {
  color: '#666',
  fontSize: '0.9rem'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '4rem',
  color: '#666',
  backgroundColor: 'white',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
};

const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4rem',
  color: '#666'
};

const spinnerStyle = {
  width: '50px',
  height: '50px',
  border: '5px solid #f3f3f3',
  borderTop: '5px solid #00209f',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: '1rem'
};

export default ArtistDashboard;