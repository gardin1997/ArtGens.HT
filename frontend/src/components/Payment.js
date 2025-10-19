import React, { useState } from 'react';
import axios from 'axios';

function Payment({ artwork, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulation de paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Marquer l'œuvre comme vendue
      await axios.post('http://localhost:5555/api/confirm-payment', {
        artwork_id: artwork.id
      });
      
      onSuccess();
    } catch (err) {
      setError('Erreur lors du paiement: ' + (err.response?.data?.error || err.message));
    }
    
    setLoading(false);
  };

  return (
    <div style={paymentContainerStyle}>
      <div style={paymentInfoStyle}>
        <h4>Simulation de Paiement</h4>
        <p>Œuvre: <strong>{artwork.title}</strong></p>
        <p>Artiste: <strong>{artwork.artist_name}</strong></p>
        <p>Montant: <strong>${artwork.price}</strong></p>
        <p style={repartitionStyle}>
          Répartition: 75% artiste, 10% plateforme, 15% ELJ
        </p>
      </div>

      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}

      <button 
        onClick={handlePayment}
        disabled={loading}
        style={payButtonStyle}
      >
        {loading ? 'Traitement...' : `Simuler le paiement de $${artwork.price}`}
      </button>

      <p style={noteStyle}>
        💡 Pour l'instant, cette fonctionnalité simule un paiement. 
        L'intégration Stripe sera ajoutée ultérieurement.
      </p>
    </div>
  );
}

const paymentContainerStyle = { 
  width: '100%',
  maxWidth: '500px'
};

const paymentInfoStyle = {
  backgroundColor: '#f8f9fa',
  padding: '1.5rem',
  borderRadius: '5px',
  marginBottom: '1rem',
  border: '1px solid #ddd'
};

const repartitionStyle = {
  fontSize: '0.9rem',
  color: '#666',
  marginTop: '0.5rem',
  fontStyle: 'italic'
};

const errorStyle = {
  color: '#d21010',
  backgroundColor: '#ffe6e6',
  padding: '1rem',
  borderRadius: '5px',
  marginBottom: '1rem',
  border: '1px solid #ffb3b3'
};

const payButtonStyle = {
  width: '100%',
  padding: '1rem',
  backgroundColor: '#00209f',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  marginBottom: '1rem'
};

const noteStyle = {
  fontSize: '0.8rem',
  color: '#666',
  textAlign: 'center',
  fontStyle: 'italic'
};

export default Payment;