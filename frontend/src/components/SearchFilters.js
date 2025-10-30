import React, { useState } from 'react';
import './SearchFilters.css'; // 💅 Styles séparés pour hover et responsive

function SearchFilters({ onFilterChange, onSearch }) {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });

  const handleChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
    };
    setFilters(resetFilters);
    onFilterChange?.(resetFilters);
    onSearch?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.();
  };

  return (
    <div className="filters-container">
      <h3 className="filters-title">🎨 Filtrer les œuvres</h3>

      <form onSubmit={handleSubmit} className="filters-form">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Rechercher par titre..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group two-cols">
          <input
            type="number"
            placeholder="Prix minimum"
            value={filters.minPrice}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            className="filter-input"
          />
          <input
            type="number"
            placeholder="Prix maximum"
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="filter-input"
          >
            <option value="">Toutes les catégories</option>
            <option value="Peinture">Peinture</option>
            <option value="Sculpture">Sculpture</option>
            <option value="Photographie">Photographie</option>
            <option value="Portrait">Portrait</option>
            <option value="Artisanat">Artisanat</option>
            <option value="Poterie">Poterie</option>
          </select>
        </div>

        <div className="filter-buttons">
          <button type="submit" className="btn-primary">
            🔍 Appliquer les filtres
          </button>

          <button type="button" onClick={handleReset} className="btn-secondary">
            Réinitialiser
          </button>
        </div>
      </form>
    </div>
  );
}

export default SearchFilters;
