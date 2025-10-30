// ✅ Fonction pour mesurer les performances de ton app React
// Compatible avec React 18+ / 19 et déploiement Vercel

const reportWebVitals = (onPerfEntry) => {
  // Vérifie que l’argument passé est bien une fonction
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals')
      .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        // Ces fonctions mesurent différents indicateurs de performance :
        // CLS  = Cumulative Layout Shift (stabilité visuelle)
        // FID  = First Input Delay (réactivité)
        // FCP  = First Contentful Paint (vitesse d’affichage)
        // LCP  = Largest Contentful Paint (chargement principal)
        // TTFB = Time To First Byte (temps de réponse serveur)
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
      })
      .catch((err) => {
        console.warn('⚠️ Impossible de charger web-vitals :', err);
      });
  }
};

export default reportWebVitals;
