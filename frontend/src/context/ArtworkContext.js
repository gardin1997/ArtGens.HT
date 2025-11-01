import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// 🌍 Configuration dynamique de l'API
const API_URL =
  process.env.REACT_APP_API_URL || 'https://artgens-ht-2.onrender.com/api';

const ArtworkContext = createContext();

const initialState = {
  artworks: [],
  user: null,
  cart: [],
  loading: false,
  token: localStorage.getItem('token')
};

// 🎯 Reducer global
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

export function ArtworkProvider({ children }) {
  const [state, dispatch] = useReducer(artworkReducer, initialState);

  // ⚙️ Gestion du token d’auth
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // 🔁 Charger le profil utilisateur si token présent
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !state.user) {
      axios
        .get(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
          dispatch({ type: 'SET_USER', payload: response.data });
        })
        .catch(err => {
          console.error('Erreur récupération user:', err);
          dispatch({ type: 'LOGOUT' });
        });
    }
  }, []);

  // 🎨 Charger les catégories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      return response.data;
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
      return [];
    }
  };

  // 🖼️ Charger les œuvres
  const fetchArtworks = async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(`${API_URL}/artworks?${params}`);
      dispatch({ type: 'SET_ARTWORKS', payload: response.data || [] });
    } catch (error) {
      console.error('Erreur chargement artworks:', error);
      dispatch({ type: 'SET_ARTWORKS', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ➕ Ajouter une œuvre
  const addArtwork = async artworkData => {
    try {
      const response = await axios.post(`${API_URL}/artworks`, artworkData);
      await fetchArtworks();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('🔥 Erreur ajout œuvre :', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur serveur'
      };
    }
  };

  // 🔐 Connexion
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur de connexion'
      };
    }
  };

  // 📝 Inscription
  const register = async userData => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Erreur d'inscription"
      };
    }
  };

  // 🚪 Déconnexion
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    delete axios.defaults.headers.common['Authorization'];
  };

  // 🛒 Panier
  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      dispatch({ type: 'SET_CART', payload: response.data });
    } catch (error) {
      console.error('Erreur chargement panier:', error);
    }
  };

  const addToCart = async artworkId => {
    try {
      const response = await axios.post(
        `${API_URL}/cart`,
        { artwork_id: artworkId },
        { headers: { Authorization: `Bearer ${state.token}` } }
      );
      await fetchCart();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur ajout panier:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur ajout panier'
      };
    }
  };

  const removeFromCart = async itemId => {
    try {
      await axios.delete(`${API_URL}/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      await fetchCart();
    } catch (error) {
      console.error('Erreur suppression panier:', error);
    }
  };

  const checkoutCart = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/cart/checkout`,
        {},
        { headers: { Authorization: `Bearer ${state.token}` } }
      );
      dispatch({ type: 'SET_CART', payload: [] });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Erreur checkout:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur paiement'
      };
    }
  };

  // ❤️ Like œuvre
  const likeArtwork = async artworkId => {
    try {
      const response = await axios.post(
        `${API_URL}/artworks/${artworkId}/like`,
        {},
        { headers: { Authorization: `Bearer ${state.token}` } }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors du like:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors du like'
      };
    }
  };

  // 💬 Commentaires
  const fetchComments = async artworkId => {
    try {
      const response = await axios.get(`${API_URL}/artworks/${artworkId}/comments`);
      return response.data;
    } catch (error) {
      console.error('Erreur chargement commentaires:', error);
      return [];
    }
  };

  const addComment = async (artworkId, content) => {
    try {
      const response = await axios.post(
        `${API_URL}/artworks/${artworkId}/comments`,
        { content },
        { headers: { Authorization: `Bearer ${state.token}` } }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur ajout commentaire'
      };
    }
  };

  // ✏️ Mise à jour œuvre
  const updateArtwork = async (artworkId, updatedData) => {
    try {
      const response = await axios.put(
        `${API_URL}/artworks/${artworkId}`,
        updatedData,
        { headers: { Authorization: `Bearer ${state.token}` } }
      );
      await fetchArtworks();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur modification œuvre:', error);
      return { success: false, error: 'Erreur mise à jour' };
    }
  };

  // 🗑️ Suppression œuvre
  const deleteArtwork = async artworkId => {
    try {
      await axios.delete(`${API_URL}/artworks/${artworkId}`, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      await fetchArtworks();
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression œuvre:', error);
      return { success: false, error: 'Erreur suppression' };
    }
  };

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
        updateArtwork,
        deleteArtwork,
        fetchCart,
        addToCart,
        removeFromCart,
        checkoutCart,
        likeArtwork,
        fetchComments,
        addComment
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
    throw new Error('useArtwork must be used within an ArtworkProvider');
  }
  return context;
};
