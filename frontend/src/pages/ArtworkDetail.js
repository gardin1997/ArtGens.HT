import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useArtwork } from "../context/ArtworkContext";
import axios from "axios";
import Payment from "../components/Payment";

function ArtworkDetail() {
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, likeArtwork, token } = useArtwork();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [inCart, setInCart] = useState(false);

 
  useEffect(() => {
    fetchArtwork();
    fetchComments();
    checkInCart();
  }, [id]);

  
  const checkInCart = async () => {
    if (!user) return;
    try {
      const res = await axios.get("http://127.0.0.1:5555/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const found = res.data.find((item) => item.artwork_id === parseInt(id));
      setInCart(!!found);
    } catch (error) {
      console.error("Erreur vérification panier:", error);
    }
  };

  
  const fetchArtwork = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5555/api/artworks/${id}`
      );
      setArtwork(response.data);
      if (user) {
        setIsLiked(Math.random() > 0.5); 
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l’œuvre:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  
  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5555/api/artworks/${id}/comments`
      );
      setComments(res.data);
    } catch (error) {
      console.error("Erreur chargement commentaires:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(
        `http://127.0.0.1:5555/api/artworks/${id}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Erreur ajout commentaire:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    try {
      await axios.delete(`http://127.0.0.1:5555/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error("Erreur suppression commentaire:", error);
    }
  };

  
  const handleLike = async () => {
    if (!user) {
      alert("Veuillez vous connecter pour aimer cette œuvre");
      return;
    }

    const result = await likeArtwork(id);
    if (result.success) {
      setIsLiked(result.data.liked);
      fetchArtwork();
    }
  };

 
  const handleBuy = () => {
    if (!user) {
      alert("Veuillez vous connecter pour acheter cette œuvre");
      return;
    }
    setShowPayment(true);
  };

  
  const handleAddToCart = async () => {
    if (!user) {
      alert("Veuillez vous connecter pour ajouter au panier");
      return;
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:5555/api/cart",
        { artwork_id: artwork.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setInCart(true);
    } catch (error) {
      const msg = error.response?.data?.error || "Erreur ajout panier";
      alert(msg);
    }
  };

  
  const handlePaymentSuccess = () => {
    alert("Félicitations ! Vous avez acheté cette œuvre 🎉");
    setShowPayment(false);
    navigate("/");
  };

  
  if (loading) return <p>Chargement...</p>;
  if (!artwork)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Œuvre introuvable</h2>
        <button onClick={() => navigate("/")}>Retour à la galerie</button>
      </div>
    );

  return (
    <div style={container}>
      <h2>{artwork.title}</h2>

      {/* 📊 Barre d'infos */}
      <div style={statsBar}>
        <div style={statItem}>❤️ {artwork.likes_count || 0}</div>
        <div style={statItem}>💬 {comments.length}</div>
        <div style={statItem}>🔁 {artwork.shares_count || 0}</div>
        <div style={statItem}>⭐ {artwork.favorites_count || 0}</div>
      </div>

      <img src={artwork.image_url} alt={artwork.title} style={artImage} />

      <p>{artwork.description}</p>
      <p style={{ fontWeight: "bold" }}>Prix : ${artwork.price}</p>

      {/* ❤️ Boutons principaux */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleLike} style={likeButton}>
          {isLiked ? "❤️ Liké" : "🤍 J’aime"} ({artwork.likes_count || 0})
        </button>

        {artwork.is_sold ? (
          <button disabled style={{ marginLeft: "10px" }}>
            💔 Vendu
          </button>
        ) : (
          <>
            <button onClick={handleBuy} style={buyNowButton}>
              💳 Acheter maintenant
            </button>
            <button
              onClick={handleAddToCart}
              style={{
                ...addToCartButton,
                backgroundColor: inCart ? "#6c757d" : "#00209f",
                cursor: inCart ? "not-allowed" : "pointer",
              }}
              disabled={inCart}
            >
              {inCart ? "✅ Déjà dans le panier" : "🛒 Ajouter au panier"}
            </button>
          </>
        )}
      </div>

      {/* 💬 Commentaires */}
      <div style={commentSection}>
        <h3>💬 Commentaires</h3>
        {comments.length === 0 ? (
          <p>Aucun commentaire pour le moment.</p>
        ) : (
          <ul>
            {comments.map((c) => (
              <li key={c.id} style={commentCard}>
                <strong>{c.author}</strong> ({c.created_at})<br />
                {c.content}
                {user && user.id === c.user_id && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    style={{ marginLeft: "10px", color: "red" }}
                  >
                    🗑️ Supprimer
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {user ? (
          <div>
            <textarea
              rows="3"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Écris un commentaire..."
              style={commentInput}
            />
            <button onClick={handleAddComment} style={sendButton}>
              Envoyer 💬
            </button>
          </div>
        ) : (
          <p>Connectez-vous pour laisser un commentaire.</p>
        )}
      </div>

      {/* 💳 Paiement */}
      {showPayment && artwork.is_available && (
        <div style={{ marginTop: "30px" }}>
          <h3>Paiement sécurisé</h3>
          <Payment artwork={artwork} onSuccess={handlePaymentSuccess} />
          <button onClick={() => setShowPayment(false)}>Annuler</button>
        </div>
      )}
    </div>
  );
}


const container = {
  padding: "2rem",
  maxWidth: "800px",
  margin: "100px auto",
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
};

const statsBar = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "8px 0",
  marginBottom: "10px",
  fontSize: "16px",
  fontWeight: "500",
};

const statItem = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
};

const artImage = {
  width: "100%",
  height: "400px",
  objectFit: "cover",
  borderRadius: "10px",
};

const likeButton = {
  backgroundColor: "#ff4d6d",
  color: "white",
  border: "none",
  padding: "10px 15px",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "10px",
};

const addToCartButton = {
  backgroundColor: "#00209f",
  color: "white",
  border: "none",
  padding: "10px 15px",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "10px",
};

const buyNowButton = {
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  padding: "10px 15px",
  borderRadius: "6px",
  cursor: "pointer",
};

const commentSection = {
  marginTop: "30px",
  borderTop: "1px solid #ddd",
  paddingTop: "1rem",
};

const commentCard = {
  backgroundColor: "#f9f9f9",
  padding: "10px",
  borderRadius: "8px",
  marginTop: "8px",
};

const commentInput = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  marginTop: "10px",
};

const sendButton = {
  backgroundColor: "#00209f",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "8px 16px",
  marginTop: "10px",
  cursor: "pointer",
};

export default ArtworkDetail;