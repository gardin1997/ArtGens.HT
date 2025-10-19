import React, { useEffect, useState } from 'react';
import { useArtwork } from '../context/ArtworkContext';
import { Link } from 'react-router-dom';
import SearchFilters from '../components/SearchFilters';

function Home() {
  const { artworks, fetchArtworks, loading, user, likeArtwork } = useArtwork();
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchArtworks(filters);
  }, [filters]);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const handleLike = async (artworkId) => {
    if (!user) {
      alert('Veuillez vous connecter pour aimer une œuvre');
      return;
    }
    await likeArtwork(artworkId);
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={spinnerStyle}></div>
        <p>Chargement des œuvres...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div className="container">
        <header style={headerStyle}>
          <h1 style={titleStyle}>ArtGens.HT</h1>
          <p style={subtitleStyle}>
            Découvrez et achetez des œuvres d'art exceptionnelles 
            d'artistes haïtiens talentueux
          </p>
        </header>

        <SearchFilters onFilter={handleFilter} />

        <div style={gridStyle}>
          {artworks.map(artwork => (
            <div key={artwork.id} className="card" style={cardStyle}>
              <div style={imageContainerStyle}>
                <img 
                  src={artwork.image_url || '/placeholder-image.jpg'} 
                  alt={artwork.title}
                  style={imageStyle}
                />
                <div style={overlayStyle}>
                  <button 
                    onClick={() => handleLike(artwork.id)}
                    style={likeButtonStyle}
                  >
                    ❤️ {artwork.likes_count}
                  </button>
                </div>
              </div>
              
              <div style={infoStyle}>
                <h3 style={artworkTitleStyle}>{artwork.title}</h3>
                <p style={artistStyle}>Par {artwork.artist_name}</p>
                <p style={priceStyle}>${artwork.price}</p>
                <div style={categoriesStyle}>
                  {artwork.categories.map(cat => (
                    <span key={cat} style={categoryTagStyle}>{cat}</span>
                  ))}
                </div>
                <Link 
                  to={`/artwork/${artwork.id}`} 
                  style={detailsButtonStyle}
                >
                  Voir détails
                </Link>
              </div>
            </div>
          ))}
        </div>

        {artworks.length === 0 && !loading && (
          <div style={emptyStateStyle}>
            <h3>Aucune œuvre trouvée</h3>
            <p>Essayez de modifier vos critères de recherche</p>
          </div>
        )}
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

const titleStyle = {
  fontSize: '3rem',
  color: '#00209f',
  marginBottom: '1rem'
};

const subtitleStyle = {
  fontSize: '1.2rem',
  color: '#6c757d',
  maxWidth: '600px',
  margin: '0 auto'
};

const gridStyle = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
  gap: '2rem' 
};

const cardStyle = { 
  transition: 'all 0.3s ease' 
};

const imageContainerStyle = {
  position: 'relative',
  overflow: 'hidden'
};

const imageStyle = { 
  width: '100%', 
  height: '250px', 
  objectFit: 'cover',
  transition: 'transform 0.3s ease'
};

const overlayStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px'
};

const likeButtonStyle = {
  background: 'rgba(255, 255, 255, 0.9)',
  border: 'none',
  borderRadius: '20px',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  fontSize: '0.9rem',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
};

const infoStyle = { 
  padding: '1.5rem' 
};

const artworkTitleStyle = {
  fontSize: '1.2rem',
  marginBottom: '0.5rem',
  color: '#333'
};

const artistStyle = {
  color: '#666',
  marginBottom: '0.5rem',
  fontSize: '0.9rem'
};

const priceStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#00209f',
  marginBottom: '1rem'
};

const categoriesStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginBottom: '1rem'
};

const categoryTagStyle = {
  backgroundColor: '#e9ecef',
  color: '#495057',
  padding: '0.25rem 0.5rem',
  borderRadius: '15px',
  fontSize: '0.8rem'
};

const detailsButtonStyle = {
  display: 'block',
  textAlign: 'center',
  padding: '0.75rem',
  backgroundColor: '#00209f',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  transition: 'background-color 0.3s ease'
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

const emptyStateStyle = {
  textAlign: 'center',
  padding: '4rem',
  color: '#666'
};

// Animation CSS pour le spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default Home;