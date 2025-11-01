// src/context/ArtworkContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Création du contexte global
const ArtworkContext = createContext();

// 🌍 URL dynamique (local ↔ Render)
export const API_URL =
  process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : window.location.hostname.includes("localhost")
    ? "http://127.0.0.1:5555/api"
    : "https://artgens-ht-2.onrender.com/api";

console.log("🔗 API_URL utilisée :", API_URL);

// État initial
const initialState = {
  artworks: [],
  user: null,
  cart: [],
  loading: false,
  token: localStorage.getItem('token')
};

// Reducer principal
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
    case 'ADD_TO_CART':
      return { ...state, cart: [...state.cart, action.payload] };
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.id !== action.payload) };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    default:
      return state;
  }
}

// Provider
export function ArtworkProvider({ children }) {
  const [state, dispatch] = useReducer(artworkReducer, initialState);

  // Configuration Axios avec le token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [state.token]);

  // 🔹 Charger les œuvres
  const fetchArtworks = async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await axios.get(`${API_URL}/artworks`, { params: filters });
      dispatch({ type: 'SET_ARTWORKS', payload: response.data || [] });
    } catch (error) {
      console.error('Erreur de chargement des œuvres :', error);
      dispatch({ type: 'SET_ARTWORKS', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 🔹 Connexion
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Erreur de connexion' };
    }
  };

  // 🔹 Inscription
  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
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

  // 🔹 Ajouter une œuvre
  const addArtwork = async (artworkData) => {
    try {
      const response = await axios.post(`${API_URL}/artworks`, artworkData);
      await fetchArtworks();
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Erreur d'ajout" };
    }
  };

  // 🔹 Like
  const likeArtwork = async (artworkId) => {
    try {
      const response = await axios.post(`${API_URL}/artworks/${artworkId}/like`);
      await fetchArtworks();
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Erreur like' };
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
        likeArtwork
      }}
    >
      {children}
    </ArtworkContext.Provider>
  );
}

export const useArtwork = () => {
  const context = useContext(ArtworkContext);
  if (!context) throw new Error('useArtwork must be used within an ArtworkProvider');
  return context;
};
