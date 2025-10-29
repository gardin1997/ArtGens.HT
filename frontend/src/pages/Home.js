import React, { useEffect, useState } from "react";
import { useArtwork } from "../context/ArtworkContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  const { artworks, fetchArtworks, fetchCategories, loading } = useArtwork();
  const [filters, setFilters] = useState({
    title: "",
    min_price: "",
    max_price: "",
    category: "",
    sort: "",
  });
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArtworks();
    fetchCategories().then(setCategories);
  }, []);

  const handleFilter = () => {
    fetchArtworks(filters);
    setMenuOpen(false);
  };

  const handleReset = () => {
    setFilters({
      title: "",
      min_price: "",
      max_price: "",
      category: "",
      sort: "",
    });
    fetchArtworks();
  };

  const handleOverlayClick = () => setMenuOpen(false);

  return (
    <>
      <Navbar onToggleMenu={() => setMenuOpen(!menuOpen)} />
      {menuOpen && <div style={overlayStyle} onClick={handleOverlayClick}></div>}

      <div style={pageContainer}>
        <aside
          style={{
            ...sidebarStyle,
            transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
            opacity: menuOpen ? 1 : 0,
          }}
        >
          <div style={sidebarHeader}>
            <h3>🎨 Filtres</h3>
            <button onClick={() => setMenuOpen(false)} style={closeButton}>
              ❌
            </button>
          </div>

          <input
            type="text"
            placeholder="Rechercher une œuvre..."
            value={filters.title}
            onChange={(e) => setFilters({ ...filters, title: e.target.value })}
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Prix minimum"
            value={filters.min_price}
            onChange={(e) =>
              setFilters({ ...filters, min_price: e.target.value })
            }
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Prix maximum"
            value={filters.max_price}
            onChange={(e) =>
              setFilters({ ...filters, max_price: e.target.value })
            }
            style={inputStyle}
          />

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            style={inputStyle}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            style={inputStyle}
          >
            <option value="">Trier par défaut</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="recent">Plus récentes</option>
          </select>

          <button onClick={handleFilter} style={applyButtonStyle}>
            🔍 Appliquer les filtres
          </button>
          <button onClick={handleReset} style={resetButtonStyle}>
            ♻️ Réinitialiser
          </button>
        </aside>

        {/* ✅ Galerie principale */}
        <main style={galleryContainer}>
          <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
            ArtGens.HT — Découvrez les artistes haïtiens 🖼️
          </h2>

          {loading ? (
            <p>Chargement des œuvres...</p>
          ) : artworks.length === 0 ? (
            <p>Aucune œuvre trouvée.</p>
          ) : (
            <div style={artGrid}>
              {artworks.map((art) => (
                <div
                  key={art.id}
                  style={artCard}
                  onClick={() => navigate(`/artwork/${art.id}`)}
                >
                  <img src={art.image_url} alt={art.title} style={artImage} />
                  <div style={artInfo}>
                    <h4 style={{ marginBottom: "5px" }}>{art.title}</h4>
                    <p style={{ color: "#555", fontSize: "0.9rem" }}>
                      Par {art.artist_name}
                    </p>
                    <p style={{ fontWeight: "bold", color: "#00209f" }}>
                      ${art.price}
                    </p>

                    {/* ✅ Compteurs visibles sous chaque œuvre */}
                    <div style={statRow}>
                      <span>❤️ {art.likes_count || 0}</span>
                      <span>💬 {art.comments_count || 0}</span>
                      <span>🔁 {art.shares_count || 0}</span>
                      <span>⭐ {art.favorites_count || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}


const pageContainer = {
  display: "flex",
  backgroundColor: "#f5f6fa",
  minHeight: "100vh",
  position: "relative",
};


const overlayStyle = {
  position: "fixed",
  top: "70px",
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.4)",
  backdropFilter: "blur(2px)",
  zIndex: 998,
};


const sidebarStyle = {
  width: "280px",
  backgroundColor: "#fff",
  padding: "1.5rem",
  borderRight: "1px solid #ddd",
  boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
  position: "fixed",
  top: "70px",
  left: "0",
  height: "100vh",
  overflowY: "auto",
  zIndex: 999,
  transition: "all 0.4s ease",
};

const sidebarHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
};

const closeButton = {
  background: "transparent",
  border: "none",
  fontSize: "1.3rem",
  cursor: "pointer",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "1rem",
};

const applyButtonStyle = {
  width: "100%",
  backgroundColor: "#00209f",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "10px",
  cursor: "pointer",
  marginBottom: "10px",
};

const resetButtonStyle = {
  width: "100%",
  backgroundColor: "#6c757d",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "10px",
  cursor: "pointer",
};

const galleryContainer = {
  flex: 1,
  padding: "2rem",
  marginLeft: "0",
};

const artGrid = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "2rem",
};

const artCard = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  cursor: "pointer",
  width: "320px", 
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
};

const artImage = {
  width: "100%",
  height: "280px", 
  objectFit: "cover",
  borderRadius: "12px 12px 0 0",
};

const artInfo = {
  padding: "15px",
  textAlign: "center",
};

const statRow = {
  display: "flex",
  justifyContent: "space-around",
  marginTop: "8px",
  fontSize: "15px",
  color: "#444",
};

export default Home;
