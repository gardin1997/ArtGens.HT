import React, { useState } from 'react';
import axios from 'axios';

// 🔧 URL dynamique du backend Flask
const API_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://127.0.0.1:5555/api';

function Payment({ artwork, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 💡 Simulation d’un délai réseau (2 secondes)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // ✅ Appel API dynamique
      await axios.post(`${API_URL}/confirm-payment`, {
        artwork_id: artwork.id,
      });

      onSuccess();
    } catch (err) {
      console.error('Erreur de paiement :', err);
      setError(
        'Erreur lors du paiement : ' +
          (err.response?.data?.error || err.message)
      );
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.infoBox}>
        <h4>💳 Simulation de Paiement</h4>
        <p>
          Œuvre : <strong>{artwork.title}</strong>
        </p>
        <p>
          Artiste : <strong>{artwork.artist_name}</strong>
        </p>
        <p>
          Montant : <strong>${artwork.price}</strong>
        </p>
        <p style={styles.repartition}>
          Répartition : 75% artiste, 10% plateforme, 15% ELJ
        </p>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          ...styles.button,
          backgroundColor: loading ? '#5a73d7' : '#00209f',
        }}
      >
        {loading ? '💰 Traitement...' : `Simuler le paiement de $${artwork.price}`}
      </button>

      <p style={styles.note}>
        💡 Pour l’instant, cette fonctionnalité simule un paiement.
        <br />
        L’intégration Stripe sera ajoutée ultérieurement.
      </p>
    </div>
  );
}

// ✅ Styles (plus lisibles et groupés)
const styles = {
  container: {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '5px',
    marginBottom: '1rem',
    border: '1px solid #ddd',
  },
  repartition: {
    fontSize: '0.9rem',
    color: '#666',
    marginTop: '0.5rem',
    fontStyle: 'italic',
  },
  error: {
    color: '#d21010',
    backgroundColor: '#ffe6e6',
    padding: '1rem',
    borderRadius: '5px',
    marginBottom: '1rem',
    border: '1px solid #ffb3b3',
  },
  button: {
    width: '100%',
    padding: '1rem',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
    marginBottom: '1rem',
  },
  note: {
    fontSize: '0.8rem',
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
};

export default Payment;
