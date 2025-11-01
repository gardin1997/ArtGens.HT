// src/pages/ArtworkDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useArtwork, API_URL } from "../context/ArtworkContext";
import axios from "axios";
import Payment from "../components/Payment";

function ArtworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, likeArtwork, addToCart, addComment } = useArtwork();

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Charger les données
  useEffect(() => {
    fetchArtwork();
    fetchComments();
  }, [id]);

  // 🖼️ Charger une œuvre
  const fetchArtwork = async () => {
    try {
      const response = await axios.get(`${API_URL}/artworks`);
      const found = response.data.find((a) => a.id === parseInt(id));
      setArtwork(found || null);
    } catch (error) {
      console.error("Erreur chargement œuvre:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  // 💬 Charger les commentaires
  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/artworks/${id}/comments`);
      setComments(res.data);
    } catch (error) {
      console.error("Erreur chargement commentaires:", error);
    }
  };

  // ❤️ Liker
  const handleLike = async () => {
    if (!user) {
      alert("Veuillez vous connecter pour aimer cette œuvre");
      return;
    }
    const result = await likeArtwork(id);
    if (result.success) {
      setIsLiked(result.data.liked);
      await fetchArtwork();
    }
  };

  // 🛒 Ajouter au panier
  const handleAddToCart = async () => {
    if (!user) {
      alert("Veuillez vous connecter pour ajouter au panier");
      return;
    }
    const result = await addToCart(id);
    if (result.success) {
      alert("✅ Œuvre ajoutée au panier !");
    } else {
      alert(result.error || "Erreur lors de l’ajout au panier");
    }
  };

  // 💳 Acheter directement
  const handleBuy = () => {
    if (!user) {
      alert("Veuillez vous connecter pour acheter cette œuvre");
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    alert("✅ Félicitations ! Achat réussi.");
    setShowPayment(false);
    navigate("/");
  };

  // 💬 Envoyer un commentaire
  const handleAddComment = async () => {
    if (!user) {
      alert("Veuillez vous connecter pour commenter");
      return;
    }
    if (!newComment.trim()) return;
    const result = await addComment(id, newComment);
    if (result.success) {
      setNewComment("");
      await fetchComments();
    } else {
      alert(result.error || "Erreur ajout commentaire");
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!artwork) return <p>Œuvre non trouvée.</p>;

  return (
    <div style={container}>
      <img
        src={artwork.image_url}
        alt={artwork.title}
        style={{ width: "100%", borderRadius: "10px" }}
      />
      <h1>{artwork.title}</h1>
      <p>{artwork.description}</p>
      <p>
        <strong>Prix :</strong> ${artwork.price}
      </p>

      {/* ❤️ Like */}
      <button onClick={handleLike} style={button}>
        {isLiked ? "❤️ Liké" : "🤍 Like"} ({artwork.likes_count || 0})
      </button>

      {/* 🛒 Ajouter au panier */}
      {!artwork.is_sold ? (
        <button onClick={handleAddToCart} style={button}>
          🛒 Ajouter au panier
        </button>
      ) : (
        <button disabled style={disabledButton}>
          💔 Vendu
        </button>
      )}

      {/* 💳 Achat direct */}
      {!artwork.is_sold && (
        <button onClick={handleBuy} style={buyButton}>
          💳 Acheter maintenant
        </button>
      )}

      {showPayment && (
        <Payment artwork={artwork} onSuccess={handlePaymentSuccess} />
      )}

      <hr />
      <h3>💬 Commentaires</h3>

      {/* Zone de saisie commentaire */}
      {user ? (
        <div style={commentBox}>
          <textarea
            placeholder="Écrire un commentaire..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={commentInput}
          />
          <button onClick={handleAddComment} style={button}>
            Envoyer 💬
          </button>
        </div>
      ) : (
        <p>Connectez-vous pour laisser un commentaire.</p>
      )}

      {/* Liste des commentaires */}
      {comments.length === 0 ? (
        <p>Aucun commentaire.</p>
      ) : (
        comments.map((c) => (
          <div key={c.id} style={commentItem}>
            <strong>{c.author}</strong> : {c.content}
          </div>
        ))
      )}
    </div>
  );
}

// 🎨 Styles
const container = {
  maxWidth: "800px",
  margin: "2rem auto",
  background: "#fff",
  padding: "2rem",
  borderRadius: "10px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
};

const button = {
  padding: "10px 20px",
  margin: "10px 5px",
  backgroundColor: "#00209f",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const buyButton = {
  ...button,
  backgroundColor: "#d21010",
};

const disabledButton = {
  ...button,
  backgroundColor: "#aaa",
  cursor: "not-allowed",
};

const commentBox = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginTop: "1rem",
};

const commentInput = {
  width: "100%",
  height: "80px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  padding: "10px",
  fontSize: "1rem",
};

const commentItem = {
  padding: "10px",
  background: "#f9f9f9",
  borderRadius: "8px",
  marginTop: "8px",
};

export default ArtworkDetail;
