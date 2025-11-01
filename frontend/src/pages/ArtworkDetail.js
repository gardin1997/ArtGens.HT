// src/pages/ArtworkDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useArtwork, API_URL } from '../context/ArtworkContext';
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
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchArtwork();
    fetchComments();
  }, [id]);

  const fetchArtwork = async () => {
    try {
      const response = await axios.get(`${API_URL}/artworks/${id}`);
      setArtwork(response.data);
    } catch (error) {
      console.error('Erreur chargement œuvre:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/artworks/${id}/comments`);
      setComments(res.data);
    } catch (error) {
      console.error('Erreur chargement commentaires:', error);
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
      await fetchArtwork();
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
    alert('✅ Félicitations ! Achat réussi.');
    setShowPayment(false);
    navigate('/');
  };

  if (loading) return <p>Chargement...</p>;
  if (!artwork) return <p>Œuvre non trouvée.</p>;

  return (
    <div className="artwork-detail">
      <img src={artwork.image_url} alt={artwork.title} style={{ width: '100%' }} />
      <h1>{artwork.title}</h1>
      <p>{artwork.description}</p>
      <p>Prix : ${artwork.price}</p>

      <button onClick={handleLike}>
        {isLiked ? '❤️ Liké' : '🤍 Like'} ({artwork.likes_count || 0})
      </button>

      <button onClick={handleBuy}>🛒 Acheter</button>

      {showPayment && (
        <Payment artwork={artwork} onSuccess={handlePaymentSuccess} />
      )}

      <hr />
      <h3>💬 Commentaires</h3>
      {comments.length === 0 ? <p>Aucun commentaire.</p> : (
        comments.map((c) => (
          <div key={c.id}>
            <strong>{c.author}</strong> : {c.content}
          </div>
        ))
      )}
    </div>
  );
}

export default ArtworkDetail;
