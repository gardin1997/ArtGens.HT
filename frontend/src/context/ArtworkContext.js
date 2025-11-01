import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// 🌍 URL API dynamique : Render ou Local
const API_URL =
  process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : 'http://127.0.0.1:5555/api';

const ArtworkContext = createContext();

const initialState = {
  artworks: [],
  user: null,
  cart: [],
  loading: false,
  token: localStorage.getItem('token')
};

// 🎯 Reducer
function artworkReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ARTWORKS':
      return { ...state, artworks: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return { ...state, user: action.payload.user, token: action.payload.token };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return { ...state, user: null, token: null, cart: [] };
    case 'SET_CART':
      return { ...state, cart: action.payload };
    default:
      return state;
  }
}

export function ArtworkProvider({ children }) {
  const [state, dispatch] = useReducer(artworkReducer, initialState);

  // ⚙️ Auth automatique
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axios.defaults.headers.common['Authorization'];
  }, [state.token]);

  // 🔁 Charger le profil utilisateur
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !state.user) {
      axios
        .get(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => dispatch({ type: 'SET_USER', payload: res.data }))
        .catch(() => dispatch({ type: 'LOGOUT' }));
    }
  }, []);

  // 🎨 Œuvres
  const fetchArtworks = async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await axios.get(`${API_URL}/artworks?${params}`);
      dispatch({ type: 'SET_ARTWORKS', payload: res.data || [] });
    } catch (e) {
      console.error('Erreur chargement artworks:', e);
      dispatch({ type: 'SET_ARTWORKS', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ➕ Ajouter une œuvre
  const addArtwork = async data => {
    try {
      const res = await axios.post(`${API_URL}/artworks`, data, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      await fetchArtworks();
      return { success: true, data: res.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.error || 'Erreur ajout œuvre' };
    }
  };

  // 🔐 Connexion
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.error || 'Erreur de connexion' };
    }
  };

  // 📝 Inscription
  const register = async data => {
    try {
      const res = await axios.post(`${API_URL}/register`, data);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.error || "Erreur d'inscription" };
    }
  };

  // 🚪 Déconnexion
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    delete axios.defaults.headers.common['Authorization'];
  };

  // ❤️ Like
  const likeArtwork = async artworkId => {
    try {
      const res = await axios.post(
        `${API_URL}/artworks/${artworkId}/like`,
        {},
        { headers: { Authorization: `Bearer ${state.token}` } }
      );
      return { success: true, data: res.data };
    } catch (e) {
      console.error('Erreur Like:', e);
      return { success: false, error: e.response?.data?.error || 'Erreur like' };
    }
  };

  // 💬 Commentaires
  const fetchComments = async id => {
    try {
      const res = await axios.get(`${API_URL}/artworks/${id}/comments`);
      return res.data;
    } catch {
      return [];
    }
  };

  const addComment = async (id, content) => {
    try {
      const res = await axios.post(
        `${API_URL}/artworks/${id}/comments`,
        { content },
        { headers: { Authorization: `Bearer ${state.token}` } }
      );
      return { success: true, data: res.data };
    } catch (e) {
      console.error('Erreur ajout commentaire:', e);
      return { success: false, error: e.response?.data?.error || 'Erreur commentaire' };
    }
  };

  // 🛒 Panier
  const fetchCart = async () => {
    try {
      const res = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      dispatch({ type: 'SET_CART', payload: res.data });
    } catch (e) {
      console.error('Erreur chargement panier:', e);
    }
  };

  const addToCart = async artworkId => {
    try {
      const res = await axios.post(
        `${API_URL}/cart`,
        { artwork_id: artworkId },
        { headers: { Authorization: `Bearer ${state.token}` } }
      );
      await fetchCart();
      return { success: true, data: res.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.error || 'Erreur ajout panier' };
    }
  };

  const removeFromCart = async id => {
    try {
      await axios.delete(`${API_URL}/cart/${id}`, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      await fetchCart();
    } catch (e) {
      console.error('Erreur suppression panier:', e);
    }
  };

  const checkoutCart = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/cart/checkout`,
        {},
        { headers: { Authorization: `Bearer ${state.token}` } }
      );
      dispatch({ type: 'SET_CART', payload: [] });
      return { success: true, message: res.data.message };
    } catch (e) {
      return { success: false, error: e.response?.data?.error || 'Erreur paiement' };
    }
  };

  // ✏️ Mise à jour / suppression œuvre
  const updateArtwork = async (id, data) => {
    try {
      const res = await axios.put(`${API_URL}/artworks/${id}`, data, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      await fetchArtworks();
      return { success: true, data: res.data };
    } catch {
      return { success: false, error: 'Erreur mise à jour' };
    }
  };

  const deleteArtwork = async id => {
    try {
      await axios.delete(`${API_URL}/artworks/${id}`, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      await fetchArtworks();
      return { success: true };
    } catch {
      return { success: false, error: 'Erreur suppression' };
    }
  };

  return (
    <ArtworkContext.Provider
      value={{
        ...state,
        dispatch,
        fetchArtworks,
        login,
        register,
        logout,
        addArtwork,
        updateArtwork,
        deleteArtwork,
        likeArtwork,
        fetchComments,
        addComment,
        fetchCart,
        addToCart,
        removeFromCart,
        checkoutCart
      }}
    >
      {children}
    </ArtworkContext.Provider>
  );
}

export const useArtwork = () => {
  const context = useContext(ArtworkContext);
  if (!context)
    throw new Error('useArtwork must be used within an ArtworkProvider');
  return context;
};
