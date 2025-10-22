import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useArtwork } from '../context/ArtworkContext';
import axios from 'axios';
import Payment from '../components/Payment';

function ArtworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, likeArtwork } = useArtwork();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchArtwork();
  }, [id]);

  const fetchArtwork = async () => {
    try {
      const response = await axios.get(`http://localhost:5555/api/artworks/${id}`);
      setArtwork(response.data);
      
      // Vérifier si l'utilisateur a déjà liké cette œuvre
      if (user) {
        // Cette vérification serait normalement faite côté backend
        // Pour la démo, on simule
        setIsLiked(Math.random() > 0.5); // Simulation
      }
    } catch (error) {
      console.error('Error fetching artwork:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Veuillez vous connecter pour aimer cette œuvre');
      return;
    }

    const result = await likeArtwork(id);
    if (result.success) {
      setIsLiked(result.data.liked);
      await fetchArtwork(); // Recharger les données
    }
  };

  const handleBuy = () => {
    if (!user) {
      alert('Veuillez vous connecter pour acheter cette œuvre');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    alert('Félicitations ! Vous avez acheté cette œuvre !');
    setShowPayment(false);
    navigate('/');
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={spinnerStyle}></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div style={errorStyle}>
        <h2>Œuvre non trouvée</h2>
        <button onClick={() => navigate('/')} style={buttonStyle}>
          Retour à la galerie
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div className="container">
        <div style={contentStyle}>
          <div style={imageSectionStyle}>
            <img 
              src={artwork.image_url || '/placeholder-image.jpg'} 
              alt={artwork.title}
              style={imageStyle}
            />
          </div>
          
          <div style={detailsSectionStyle}>
            <h1 style={titleStyle}>{artwork.title}</h1>
            
            <div style={artistInfoStyle}>
              <h3 style={artistTitleStyle}>Artiste</h3>
              <p style={artistNameStyle}>{artwork.artist_name}</p>
              {artwork.artist_bio && (
                <p style={artistBioStyle}>{artwork.artist_bio}</p>
              )}
            </div>
            
            <div style={priceSectionStyle}>
              <h2 style={priceStyle}>${artwork.price}</h2>
              <p style={repartitionStyle}>
                Répartition : 75% artiste, 10% plateforme, 15% ELJ
              </p>
            </div>
            
            <div style={descriptionStyle}>
              <h3>Description</h3>
              <p>{artwork.description || 'Aucune description disponible.'}</p>
            </div>
            
            <div style={categoriesStyle}>
              <h3>Catégories</h3>
              <div style={tagsStyle}>
                {/* CORRECTION APPLIQUÉE ICI : (artwork.categories || []) */}
                {(artwork.categories || []).map(cat => (
                  <span key={cat} style={tagStyle}>{cat}</span>
                ))}
              </div>
            </div>
            
            <div style={statsStyle}>
              <span style={statStyle}>
                ❤️ {artwork.likes_count || 0} likes
              </span>
              <span style={statStyle}>
                📅 Ajoutée le {new Date(artwork.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <div style={actionsStyle}>
              <button 
                onClick={handleLike}
                style={isLiked ? likedButtonStyle : likeButtonStyle}
              >
                {isLiked ? '❤️ Liké' : '🤍 Like'} ({artwork.likes_count || 0})
              </button>
              
              {artwork.is_available ? (
                <button 
                  onClick={handleBuy}
                  style={buyButtonStyle}
                >
                  🛒 Acheter maintenant
                </button>
              ) : (
                <button disabled style={soldButtonStyle}>
                  💔 Vendu
                </button>
              )}
            </div>
            
            {showPayment && artwork.is_available && (
              <div style={paymentSectionStyle}>
                <h3>Paiement sécurisé</h3>
                <Payment 
                  artwork={artwork} 
                  onSuccess={handlePaymentSuccess}
                />
                <button 
                  onClick={() => setShowPayment(false)}
                  style={cancelButtonStyle}
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ... (gardez tous les styles existants, ils sont corrects)

const containerStyle = { 
  padding: '2rem 0',
  minHeight: 'calc(100vh - 70px)'
};

const contentStyle = { 
  display: 'grid', 
  gridTemplateColumns: '1fr 1fr', 
  gap: '3rem',
  alignItems: 'start'
};

const imageSectionStyle = {
  position: 'sticky',
  top: '90px'
};

const imageStyle = { 
  width: '100%', 
  borderRadius: '10px',
  boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)'
};

const detailsSectionStyle = { 
  padding: '0 1rem' 
};

const titleStyle = {
  fontSize: '2.5rem',
  color: '#00209f',
  marginBottom: '1rem'
};

const artistInfoStyle = {
  marginBottom: '2rem',
  padding: '1.5rem',
  backgroundColor: '#f8f9fa',
  borderRadius: '10px'
};

const artistTitleStyle = {
  color: '#666',
  marginBottom: '0.5rem',
  fontSize: '1rem'
};

const artistNameStyle = {
  fontSize: '1.3rem',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '0.5rem'
};

const artistBioStyle = {
  color: '#666',
  lineHeight: '1.6'
};

const priceSectionStyle = {
  marginBottom: '2rem',
  padding: '1.5rem',
  backgroundColor: '#e7f3ff',
  borderRadius: '10px',
  border: '2px solid #00209f'
};

const priceStyle = {
  fontSize: '2.5rem',
  color: '#00209f',
  marginBottom: '0.5rem'
};

const repartitionStyle = {
  color: '#666',
  fontSize: '0.9rem'
};

const descriptionStyle = {
  marginBottom: '2rem'
};

const categoriesStyle = {
  marginBottom: '2rem'
};

const tagsStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginTop: '0.5rem'
};

const tagStyle = {
  backgroundColor: '#00209f',
  color: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '20px',
  fontSize: '0.9rem'
};

const statsStyle = {
  display: 'flex',
  gap: '2rem',
  marginBottom: '2rem',
  color: '#666'
};

const statStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const actionsStyle = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '2rem'
};

const likeButtonStyle = {
  padding: '1rem 2rem',
  backgroundColor: 'white',
  color: '#333',
  border: '2px solid #ddd',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1rem',
  flex: 1
};

const likedButtonStyle = {
  ...likeButtonStyle,
  backgroundColor: '#fff5f5',
  borderColor: '#d21010',
  color: '#d21010'
};

const buyButtonStyle = {
  padding: '1rem 2rem',
  backgroundColor: '#d21010',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1rem',
  flex: 2
};

const soldButtonStyle = {
  ...buyButtonStyle,
  backgroundColor: '#6c757d',
  cursor: 'not-allowed'
};

const paymentSectionStyle = {
  padding: '2rem',
  backgroundColor: '#f8f9fa',
  borderRadius: '10px',
  border: '1px solid #ddd'
};

const cancelButtonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '1rem',
  width: '100%'
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

const errorStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4rem',
  color: '#666'
};

const buttonStyle = {
  padding: '1rem 2rem',
  backgroundColor: '#00209f',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1rem',
  marginTop: '1rem'
};

export default ArtworkDetail;