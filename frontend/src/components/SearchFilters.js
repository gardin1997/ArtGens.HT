import React, { useState } from 'react';

function SearchFilters({ onFilter }) {
  const [filters, setFilters] = useState({
    title: '',
    category: '',
    min_price: '',
    max_price: '',
    artist: ''
  });

  const handleChange = (e) => {
    const newFilters = {
      ...filters,
      [e.target.name]: e.target.value
    };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      title: '',
      category: '',
      min_price: '',
      max_price: '',
      artist: ''
    };
    setFilters(emptyFilters);
    onFilter(emptyFilters);
  };

  return (
    <div style={filtersContainerStyle}>
      <h3 style={titleStyle}>Filtrer les œuvres</h3>
      
      <div style={filtersGridStyle}>
        <input
          type="text"
          name="title"
          placeholder="Rechercher par titre..."
          value={filters.title}
          onChange={handleChange}
          style={inputStyle}
        />
        
        <input
          type="text"
          name="artist"
          placeholder="Rechercher par artiste..."
          value={filters.artist}
          onChange={handleChange}
          style={inputStyle}
        />
        
        <input
          type="number"
          name="min_price"
          placeholder="Prix minimum ($)"
          value={filters.min_price}
          onChange={handleChange}
          style={inputStyle}
        />
        
        <input
          type="number"
          name="max_price"
          placeholder="Prix maximum ($)"
          value={filters.max_price}
          onChange={handleChange}
          style={inputStyle}
        />
        
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          style={selectStyle}
        >
          <option value="">Toutes les catégories</option>
          <option value="Peinture">Peinture</option>
          <option value="Portrait">Portrait</option>
          <option value="Artisanat">Artisanat</option>
          <option value="Poterie">Poterie</option>
          <option value="Sculpture">Sculpture</option>
          <option value="Photographie">Photographie</option>
        </select>
        
        <button onClick={clearFilters} style={clearButtonStyle}>
          Effacer
        </button>
      </div>
    </div>
  );
}

const filtersContainerStyle = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  marginBottom: '2rem'
};

const titleStyle = {
  marginBottom: '1rem',
  color: '#00209f'
};

const filtersGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
  alignItems: 'end'
};

const inputStyle = {
  padding: '0.75rem',
  border: '1px solid #ddd',
  borderRadius: '5px',
  fontSize: '1rem',
  width: '100%'
};

const selectStyle = {
  ...inputStyle,
  backgroundColor: 'white'
};

const clearButtonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1rem'
};

export default SearchFilters;