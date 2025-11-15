import React, { useState } from 'react';

const SearchBar = ({ onSearch, isLoading }) => {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSearch(keyword.trim());
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter keyword (e.g., Bitcoin, Apple, etc.)"
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #00D4FF',
            borderRadius: '8px'
          }}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#00D4FF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
