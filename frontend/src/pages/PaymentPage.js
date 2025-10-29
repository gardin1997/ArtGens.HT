import React, { useState } from "react";
import { useArtwork } from "../context/ArtworkContext";
import { useNavigate } from "react-router-dom";

function PaymentPage() {
  const { cart, checkoutCart, user } = useArtwork();
  const navigate = useNavigate();

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!cardName || !cardNumber || !expiry || !cvv) {
      setError("⚠️ Tous les champs sont requis.");
      return;
    }

    if (cardNumber.length < 12 || !/^\d+$/.test(cardNumber)) {
      setError("❌ Numéro de carte invalide.");
      return;
    }

    setProcessing(true);

    // Simulation d’un délai de traitement
    setTimeout(async () => {
      const response = await checkoutCart();
      setProcessing(false);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate("/"), 2500);
      } else {
        setError(response.error || "Erreur lors du paiement.");
      }
    }, 1500);
  };

  if (!user) {
    return (
      <div style={containerStyle}>
        <h2>💳 Paiement</h2>
        <p>Veuillez vous connecter pour continuer.</p>
        <button style={buttonStyle} onClick={() => navigate("/login")}>
          Se connecter
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div style={containerStyle}>
        <h2>✅ Paiement réussi !</h2>
        <p>Merci pour votre achat 🎨</p>
        <p>Redirection vers la galerie...</p>
        <div style={successAnim}>💸</div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2>💳 Paiement sécurisé</h2>
      <p>Total à payer : <strong>${total.toFixed(2)}</strong></p>

      <form onSubmit={handleSubmit} style={formStyle}>
        <label style={labelStyle}>Nom sur la carte</label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          style={inputStyle}
          placeholder="Jean Dupont"
        />

        <label style={labelStyle}>Numéro de carte</label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          style={inputStyle}
          placeholder="1234 5678 9012 3456"
        />

        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Expiration</label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              style={inputStyle}
              placeholder="MM/AA"
            />
          </div>
          <div style={{ flex: 1, marginLeft: "10px" }}>
            <label style={labelStyle}>CVV</label>
            <input
              type="password"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              style={inputStyle}
              placeholder="123"
            />
          </div>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          type="submit"
          style={buttonStyle}
          disabled={processing}
        >
          {processing ? "⏳ Paiement en cours..." : "Payer maintenant"}
        </button>
      </form>
    </div>
  );
}

// ------------------
// Styles inline
// ------------------
const containerStyle = {
  padding: "2rem",
  maxWidth: "500px",
  margin: "0 auto",
  textAlign: "center",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  marginTop: "1rem",
};

const inputStyle = {
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const labelStyle = {
  textAlign: "left",
  marginBottom: "5px",
  fontWeight: "bold",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
};

const buttonStyle = {
  padding: "12px",
  backgroundColor: "#00209f",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
};

const successAnim = {
  fontSize: "3rem",
  marginTop: "1rem",
  animation: "bounce 1s infinite",
};

export default PaymentPage;