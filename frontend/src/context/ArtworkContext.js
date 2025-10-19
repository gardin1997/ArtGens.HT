import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const ArtworkContext = createContext();

const initialState = {
  artworks: [],
  user: null,
  cart: [],
  loading: false,
  token: localStorage.getItem('token')
};

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
      return { 
        ...state, 
        user: null, 
        token: null,
        cart: []
      };
    case 'ADD_TO_CART':
      return { ...state, cart: [...state.cart, action.payload] };
    case 'REMOVE_FROM_CART':
      return { 
        ...state, 
        cart: state.cart.filter(item => item.id !== action.payload) 
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    default:
      return state;
  }
}

export function ArtworkProvider({ children }) {
  const [state, dispatch] = useReducer(artworkReducer, initialState);

  // Configuration Axios
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [state.token]);

  const fetchArtworks = async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`http://localhost:5555/api/artworks?${params}`);
      dispatch({ type: 'SET_ARTWORKS', payload: response.data });
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5555/api/login', {
        email,
        password
      });
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

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5555/api/register', userData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur d\'inscription' 
      };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    delete axios.defaults.headers.common['Authorization'];
  };

  const addArtwork = async (artworkData) => {
    try {
      const response = await axios.post('http://localhost:5555/api/artworks', artworkData);
      await fetchArtworks(); // Recharger la liste
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur lors de l\'ajout' 
      };
    }
  };

  const likeArtwork = async (artworkId) => {
    try {
      const response = await axios.post(`http://localhost:5555/api/artworks/${artworkId}/like`);
      await fetchArtworks(); // Recharger pour mettre à jour les counts
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur' 
      };
    }
  };

  return (
    <ArtworkContext.Provider value={{
      ...state,
      dispatch,
      fetchArtworks,
      login,
      register,
      logout,
      addArtwork,
      likeArtwork
    }}>
      {children}
    </ArtworkContext.Provider>
  );
}

export const useArtwork = () => {
  const context = useContext(ArtworkContext);
  if (!context) {
    throw new Error('useArtwork must be used within an ArtworkProvider');
  }
  return context;
};