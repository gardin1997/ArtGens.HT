import React, { useState } from 'react';

function SearchFilters({ onFilterChange, onSearch }) {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleChange = (name, value) => {
    const newFilters = {
      ...filters,
      [name]: value
    };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: ''
    };
    setFilters(resetFilters);
    if (onFilterChange) {
      onFilterChange(resetFilters);
    }
    if (onSearch) {
      onSearch();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch();
    }
  };

  return (
    <div style={filtersContainerStyle}>
      <h3 style={titleStyle}>Filtrer les œuvres</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={filterGroupStyle}>
          <input
            type="text"
            placeholder="Rechercher par titre..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={filterGroupStyle}>
          <input
            type="number"
            placeholder="Prix minimum"
            value={filters.minPrice}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={filterGroupStyle}>
          <input
            type="number"
            placeholder="Prix maximum"
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={filterGroupStyle}>
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            style={inputStyle}
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

        <div style={buttonsContainerStyle}>
          <button type="submit" style={searchButtonStyle}>
            🔍 Appliquer les filtres
          </button>
          
          <button type="button" onClick={handleReset} style={resetButtonStyle}>
            Enlever les filtres
          </button>
        </div>
      </form>
    </div>
  );
}

// TOUS LES STYLES DÉFINIS CI-DESSOUS
const filtersContainerStyle = {
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '8px',
  marginBottom: '30px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
};

const titleStyle = {
  marginBottom: '20px',
  color: '#333',
  fontSize: '20px'
};

const filterGroupStyle = {
  marginBottom: '15px'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
  boxSizing: 'border-box'
};

const buttonsContainerStyle = {
  display: 'flex',
  gap: '15px',
  marginTop: '20px'
};

const searchButtonStyle = {
  backgroundColor: '#00209f',
  color: 'white',
  border: 'none',
  padding: '12px 20px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  flex: 2
};

const resetButtonStyle = {
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  padding: '12px 20px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  flex: 1
};

export default SearchFilters;