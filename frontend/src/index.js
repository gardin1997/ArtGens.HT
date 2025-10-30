import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 🚀 Crée la racine React (React 18+)
const container = document.getElementById('root');
const root = createRoot(container);

// ✅ Active le mode Strict uniquement en développement
root.render(
  process.env.NODE_ENV === 'development' ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  )
);

// 📊 Optionnel : performance et analyse (désactivé par défaut)
reportWebVitals();
