import React, { useState, useEffect } from 'react';
import { useArtwork } from '../context/ArtworkContext';
import { Link } from 'react-router-dom';
import SearchFilters from '../components/SearchFilters';

function Home() {
  const { artworks, loading, fetchArtworks, user, likeArtwork } = useArtwork();
  const [filters, setFilters] = useState({});

  // Chargement initial
  useEffect(() => {
    fetchArtworks({});
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = () => {
    fetchArtworks(filters);
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
        <div style={spinnerStyle}>Chargement...</div>
      </div>
    );
  }

  // CORRECTION : Vérifier que artworks existe et est un tableau
  const displayArtworks = artworks || [];

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>ArtGens.HT</h1>
        <p style={subtitleStyle}>
          Découvrez et achetez des œuvres d'art exceptionnelles d'artistes haïtiens talentueux.
        </p>
      </div>

      <SearchFilters 
        onFilterChange={handleFilterChange} 
        onSearch={handleSearch} 
      />

      {/* CORRECTION : Utiliser displayArtworks au lieu de artworks */}
      {displayArtworks.length === 0 ? (
        <div style={noArtworkStyle}>
          <h3>Aucune œuvre trouvée</h3>
          <p>Essayez de modifier vos critères de recherche.</p>
        </div>
      ) : (
        <div style={artworksGridStyle}>
          {/* CORRECTION : Utiliser displayArtworks.map() */}
          {displayArtworks.map(artwork => (
            <div key={artwork.id} style={artworkCardStyle}>
              <Link to={`/artwork/${artwork.id}`} style={linkStyle}>
                <img 
                  src={artwork.image_url || '/placeholder-image.jpg'} 
                  alt={artwork.title}
                  style={imageStyle}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                <div style={artworkInfoStyle}>
                  <h3 style={artworkTitleStyle}>{artwork.title}</h3>
                  <p style={artistStyle}>Par {artwork.artist_name}</p>
                  <p style={priceStyle}>${artwork.price}</p>
                  <div style={likesStyle}>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleLike(artwork.id);
                      }}
                      style={likeButtonStyle}
                    >
                      ❤️ {artwork.likes_count || 0}
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Styles
const containerStyle = {
  minHeight: '100vh',
  padding: '90px 20px 20px 20px',
  backgroundColor: '#f8f9fa',
  fontFamily: 'Arial, sans-serif'
};

const loadingStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '50vh',
  fontSize: '18px',
  color: '#666'
};

const spinnerStyle = {
  padding: '20px'
};

const headerStyle = {
  textAlign: 'center',
  padding: '40px 20px',
  backgroundColor: 'white',
  marginBottom: '30px',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
};

const titleStyle = {
  fontSize: '36px',
  color: '#00209f',
  marginBottom: '15px',
  fontWeight: 'bold'
};

const subtitleStyle = {
  fontSize: '16px',
  color: '#666',
  maxWidth: '600px',
  margin: '0 auto',
  lineHeight: '1.5'
};

const noArtworkStyle = {
  textAlign: 'center',
  padding: '60px 30px',
  color: '#666',
  backgroundColor: 'white',
  borderRadius: '8px',
  margin: '30px auto',
  maxWidth: '500px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
};

const artworksGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '25px',
  padding: '0 20px 30px 20px',
  maxWidth: '1200px',
  margin: '0 auto'
};

const artworkCardStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  transition: 'all 0.3s ease'
};

const linkStyle = {
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  height: '100%'
};

const imageStyle = {
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  borderBottom: '1px solid #eee'
};

const artworkInfoStyle = {
  padding: '20px'
};

const artworkTitleStyle = {
  fontSize: '18px',
  margin: '0 0 10px 0',
  color: '#333',
  fontWeight: '600'
};

const artistStyle = {
  margin: '0 0 15px 0',
  color: '#666',
  fontSize: '14px'
};

const priceStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#00209f',
  margin: '0 0 15px 0'
};

const likesStyle = {
  display: 'flex',
  alignItems: 'center',
  borderTop: '1px solid #eee',
  paddingTop: '15px'
};

const likeButtonStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  padding: '5px 10px',
  borderRadius: '4px',
  color: '#666'
};

export default Home;