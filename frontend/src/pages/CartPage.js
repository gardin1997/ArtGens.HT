import React, { useEffect, useState } from "react";
import { useArtwork } from "../context/ArtworkContext";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const { cart, fetchCart, removeFromCart, user, loading } = useArtwork();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  
  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  
  if (!user) {
    return (
      <div style={containerStyle}>
        <h2>🛒 Mon panier</h2>
        <p>Veuillez vous connecter pour voir votre panier.</p>
        <button onClick={() => navigate("/login")} style={buttonStyle}>
          Se connecter
        </button>
      </div>
    );
  }

  
  if (cart.length === 0) {
    return (
      <div style={containerStyle}>
        <h2>🛒 Mon panier</h2>
        <p>Votre panier est vide pour le moment.</p>
        <button onClick={() => navigate("/")} style={buttonStyle}>
          Retour à la galerie
        </button>
      </div>
    );
  }

  
  return (
    <div style={cartContainer}>
      <h2 style={{ textAlign: "center" }}>🛍️ Votre panier</h2>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <div style={cartGrid}>
            {cart.map((item) => (
              <div key={item.id} style={cartCard}>
                <img
                  src={item.image_url}
                  alt={item.title}
                  style={imageStyle}
                />
                <div style={infoStyle}>
                  <h3>{item.title}</h3>
                  <p>
                    <strong>Prix :</strong> ${item.price.toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={removeButton}
                  >
                    ❌ Retirer
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={summaryBox}>
            <h3>Total : ${totalPrice.toFixed(2)}</h3>
            <button
              onClick={() => navigate("/payment")}
              style={checkoutButton}
            >
              💳 Procéder au paiement
            </button>
          </div>

          {message && <p style={{ textAlign: "center" }}>{message}</p>}
        </>
      )}
    </div>
  );
}



const containerStyle = {
  padding: "3rem",
  maxWidth: "600px",
  margin: "100px auto",
  textAlign: "center",
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
};

const cartContainer = {
  padding: "3rem",
  maxWidth: "1100px",
  margin: "100px auto", 
}

const cartGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
  marginTop: "2rem",
};

const cartCard = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  overflow: "hidden",
  textAlign: "center",
  paddingBottom: "1rem",
};

const imageStyle = {
  width: "100%",
  height: "200px",
  objectFit: "cover",
};

const infoStyle = {
  padding: "1rem",
};

const removeButton = {
  padding: "0.5rem 1rem",
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginTop: "10px",
};

const summaryBox = {
  textAlign: "center",
  backgroundColor: "#f8f9fa",
  borderRadius: "10px",
  padding: "1.5rem",
  marginTop: "2rem",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};

const checkoutButton = {
  backgroundColor: "#00209f",
  color: "white",
  border: "none",
  padding: "1rem 2rem",
  fontSize: "1.1rem",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "1rem",
};

const buttonStyle = {
  padding: "0.75rem 1.5rem",
  backgroundColor: "#00209f",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

export default CartPage;