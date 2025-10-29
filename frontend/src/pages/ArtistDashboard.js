import React, { useEffect, useState } from "react";
import { useArtwork } from "../context/ArtworkContext";

function ArtistDashboard() {
  const {
    user,
    artworks,
    fetchArtworks,
    addArtwork,
    deleteArtwork,
    updateArtwork,
    fetchCategories,
  } = useArtwork();

  const [newArtwork, setNewArtwork] = useState({
    title: "",
    price: "",
    description: "",
    image_url: "",
    category_ids: [],
  });

  const [categories, setCategories] = useState([]);
  const [editingArtwork, setEditingArtwork] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchArtworks();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const cats = await fetchCategories();
    setCategories(cats);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewArtwork({ ...newArtwork, [name]: value });
  };

  const handleCategorySelect = (e) => {
    const catId = parseInt(e.target.value);
    setNewArtwork((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(catId)
        ? prev.category_ids.filter((id) => id !== catId)
        : [...prev.category_ids, catId],
    }));
  };

  const handleAddArtwork = async () => {
    if (!newArtwork.title || !newArtwork.price || !newArtwork.image_url) {
      setMessage("⚠️ Veuillez remplir tous les champs obligatoires !");
      return;
    }

    const response = await addArtwork(newArtwork);
    if (response.success) {
      setMessage("✅ Œuvre ajoutée avec succès !");
      setNewArtwork({
        title: "",
        price: "",
        description: "",
        image_url: "",
        category_ids: [],
      });
      fetchArtworks();
    } else {
      setMessage(`❌ ${response.error}`);
    }
  };

  const handleDeleteArtwork = async (artworkId) => {
    if (!window.confirm("Supprimer cette œuvre ?")) return;
    const response = await deleteArtwork(artworkId);
    if (response.success) {
      setMessage("🗑️ Œuvre supprimée !");
      fetchArtworks();
    } else {
      setMessage(`❌ ${response.error}`);
    }
  };

  const handleEditClick = (artwork) => {
    setEditingArtwork(artwork);
    setNewArtwork({
      title: artwork.title,
      price: artwork.price,
      description: artwork.description,
      image_url: artwork.image_url,
      category_ids: artwork.categories?.map((c) => c.id) || [],
    });
  };

  const handleUpdateArtwork = async () => {
    const response = await updateArtwork(editingArtwork.id, newArtwork);
    if (response.success) {
      setMessage("✏️ Œuvre modifiée avec succès !");
      setEditingArtwork(null);
      fetchArtworks();
      setNewArtwork({
        title: "",
        price: "",
        description: "",
        image_url: "",
        category_ids: [],
      });
    } else {
      setMessage(`❌ ${response.error}`);
    }
  };

  if (!user) {
    return (
      <div style={containerStyle}>
        <h2>Tableau de bord Artiste</h2>
        <p>Veuillez vous connecter à votre compte pour accéder à vos œuvres.</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2>🎨 Tableau de bord Artiste</h2>
      <p>Bienvenue, {user.username} !</p>

      <div style={formStyle}>
        <h3>{editingArtwork ? "✏️ Modifier une œuvre" : "➕ Nouvelle œuvre"}</h3>

        <input
          type="text"
          name="title"
          placeholder="Titre *"
          value={newArtwork.title}
          onChange={handleInputChange}
          style={inputStyle}
        />

        <input
          type="number"
          name="price"
          placeholder="Prix ($) *"
          value={newArtwork.price}
          onChange={handleInputChange}
          style={inputStyle}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={newArtwork.description}
          onChange={handleInputChange}
          style={textareaStyle}
        />

        <input
          type="text"
          name="image_url"
          placeholder="URL de l'image *"
          value={newArtwork.image_url}
          onChange={handleInputChange}
          style={inputStyle}
        />

        <div>
          <label>Catégories :</label>
          <div style={categoryContainer}>
            {categories.map((cat) => (
              <label key={cat.id} style={{ marginRight: "10px" }}>
                <input
                  type="checkbox"
                  value={cat.id}
                  checked={newArtwork.category_ids.includes(cat.id)}
                  onChange={handleCategorySelect}
                />{" "}
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={editingArtwork ? handleUpdateArtwork : handleAddArtwork}
          style={buttonStyle}
        >
          {editingArtwork ? "💾 Enregistrer les modifications" : "Ajouter l'œuvre"}
        </button>

        {editingArtwork && (
          <button
            onClick={() => {
              setEditingArtwork(null);
              setNewArtwork({
                title: "",
                price: "",
                description: "",
                image_url: "",
                category_ids: [],
              });
            }}
            style={cancelButtonStyle}
          >
            ❌ Annuler
          </button>
        )}

        {message && <p style={messageStyle}>{message}</p>}
      </div>

      <hr />
      <h3>🖼️ Mes œuvres publiées</h3>
      <div style={artworkGrid}>
        {artworks
          .filter((a) => a.artist_id === user.id)
          .map((art) => (
            <div key={art.id} style={artCard}>
              <img src={art.image_url} alt={art.title} style={artImage} />
              <h4>{art.title}</h4>
              <p>
                Prix : <strong>${art.price}</strong>
              </p>
              <div>
                <button
                  onClick={() => handleEditClick(art)}
                  style={editButton}
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleDeleteArtwork(art.id)}
                  style={deleteButton}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}


const containerStyle = { padding: "2rem", maxWidth: "900px", margin: "0 auto" };
const formStyle = { marginBottom: "2rem" };
const inputStyle = { display: "block", width: "100%", padding: "10px", margin: "10px 0" };
const textareaStyle = { width: "100%", height: "80px", padding: "10px", marginBottom: "10px" };
const categoryContainer = { display: "flex", flexWrap: "wrap" };
const buttonStyle = { padding: "10px 15px", background: "#00209f", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" };
const cancelButtonStyle = { ...buttonStyle, background: "gray", marginLeft: "10px" };
const messageStyle = { marginTop: "10px" };
const artworkGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" };
const artCard = { background: "#f8f9fa", padding: "10px", borderRadius: "10px", textAlign: "center" };
const artImage = { width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px" };
const editButton = { ...buttonStyle, background: "#ffc107", color: "black", marginRight: "10px" };
const deleteButton = { ...buttonStyle, background: "#dc3545" };

export default ArtistDashboard;