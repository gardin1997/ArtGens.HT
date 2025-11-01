import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// 🎨 Création du contexte global
const ArtworkContext = createContext();

// 🌍 URL dynamique (local ↔ Render)
export const API_URL =
  process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : window.location.hostname.includes("localhost")
    ? "http://127.0.0.1:5555/api"
    : "https://artgens-ht-2.onrender.com/api";

console.log("🔗 API_URL utilisée :", API_URL);

// 🔹 État initial
const initialState = {
  artworks: [],
  user: null,
  cart: [],
  loading: false,
  token: localStorage.getItem('token')
};

// 🔹 Reducer global
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
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return { ...state, user: null, token: null, cart: [] };
    case 'SET_CART':
      return { ...state, cart: action.payload };
    default:
      return state;
  }
}

// 🔹 Provider principal
export function ArtworkProvider({ children }) {
  const [state, dispatch] = useReducer(artworkReducer, initialState);

  // Configuration du token dans Axios
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // 🔹 Charger les œuvres
  const fetchArtworks = async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await axios.get(`${API_URL}/artworks`, { params: filters });
      dispatch({ type: 'SET_ARTWORKS', payload: response.data || [] });
    } catch (error) {
      console.error('Erreur chargement œuvres:', error);
      dispatch({ type: 'SET_ARTWORKS', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 🔹 Charger les catégories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      return res.data || [];
    } catch (error) {
      console.error("Erreur chargement catégories :", error);
      return [];
    }
  };

  // 🔹 Ajouter une œuvre
  const addArtwork = async (artworkData) => {
    try {
      const res = await axios.post(`${API_URL}/artworks`, artworkData);
      await fetchArtworks();
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Erreur ajout œuvre" };
    }
  };

  // 🔹 Connexion
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Erreur de connexion" };
    }
  };

  // 🔹 Inscription
  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/register`, userData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Erreur d'inscription" };
    }
  };

  // 🔹 Déconnexion
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    delete axios.defaults.headers.common['Authorization'];
  };

  // ❤️ Like
  const likeArtwork = async (artworkId) => {
    try {
      const res = await axios.post(`${API_URL}/artworks/${artworkId}/like`);
      await fetchArtworks();
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Erreur lors du like :", error);
      return { success: false, error: error.response?.data?.error || "Erreur lors du like" };
    }
  };

  // 💬 Commentaire
  const addComment = async (artworkId, content) => {
    try {
      const res = await axios.post(`${API_URL}/artworks/${artworkId}/comments`, { content });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Erreur ajout commentaire :", error);
      return { success: false, error: error.response?.data?.error || "Erreur ajout commentaire" };
    }
  };

  // 🛒 Panier - Charger
  const fetchCart = async () => {
    try {
      const res = await axios.get(`${API_URL}/cart`);
      dispatch({ type: 'SET_CART', payload: res.data });
    } catch (error) {
      console.error("Erreur chargement panier :", error);
    }
  };

  // 🛒 Ajouter au panier
  const addToCart = async (artworkId) => {
    try {
      const res = await axios.post(`${API_URL}/cart`, { artwork_id: artworkId });
      await fetchCart();
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Erreur ajout panier" };
    }
  };

  // 🛒 Supprimer du panier
  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`${API_URL}/cart/${itemId}`);
      await fetchCart();
    } catch (error) {
      console.error("Erreur suppression panier :", error);
    }
  };

  // 💳 Paiement
  const checkoutCart = async () => {
    try {
      const res = await axios.post(`${API_URL}/cart/checkout`);
      dispatch({ type: 'SET_CART', payload: [] });
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Erreur paiement" };
    }
  };

  // 🔹 Fournisseur global
  return (
    <ArtworkContext.Provider
      value={{
        ...state,
        dispatch,
        fetchArtworks,
        fetchCategories,
        login,
        register,
        logout,
        addArtwork,
        likeArtwork,
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

// ✅ Hook personnalisé
export const useArtwork = () => {
  const context = useContext(ArtworkContext);
  if (!context) {
    throw new Error("useArtwork must be used within an ArtworkProvider");
  }
  return context;
};
