import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdvancedSearch = ({ onSearchResults }) => {
  const [query, setQuery] = useState('');
  const [teamTag, setTeamTag] = useState('All Teams');
  const [authorName, setAuthorName] = useState('');
  const [searching, setSearching] = useState(false);
  
  // 🏀 Dynamic array state for DB locker rooms
  const [teamOptions, setTeamOptions] = useState(['All Teams']);

  // 📡 Fetch group rooms dynamically on mount
  useEffect(() => {
    api.getAllGroups()
      .done((data) => {
        // Handle array responses or nested objects safely
        const groupsList = Array.isArray(data) ? data : data.groups || [];
        
        // Extract the name parameter from each group document
        const dynamicTeams = groupsList.map(g => g.name || g.teamTag).filter(Boolean);
        
        // Merge with 'All Teams' fallback keeping entries distinct
        setTeamOptions(['All Teams', ...new Set(dynamicTeams)]);
      })
      .fail((xhr) => {
        console.error("❌ Failed to fetch dynamic team tags for search:", xhr.responseText);
      });
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearching(true);

    // If all search values are blank, seamlessly fallback to loading the full main timeline
    if (!query.trim() && !authorName.trim() && (teamTag === 'All Teams')) {
      api.getFeed()
        .done((response) => {
          if (onSearchResults) {
            onSearchResults(response.posts || response || []);
          }
        })
        .fail((xhr) => {
          console.error("❌ Feed fallback reload failed:", xhr.responseJSON?.message);
        })
        .always(() => {
          setSearching(false);
        });
      return;
    }

    // Advanced multi-parameter search matrix query execution
    api.searchPosts(query, teamTag, authorName)
      .done((response) => {
        if (onSearchResults) {
          onSearchResults(response.results || []);
        }
      })
      .fail((xhr) => {
        console.error("❌ Search matrix query failed:", xhr.responseJSON?.message);
      })
      .always(() => {
        setSearching(false);
      });
  };

  return (
    <div style={{
      background: '#111316',
      border: '1px solid #222',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '30px',
      textAlign: 'left'
    }}>
      <h4 style={{ margin: '0 0 15px 0', color: '#FDB927', fontSize: '1.1rem' }}>🔎 ADVANCED LEAGUE SEARCH (3-Parameters)</h4>
      
      <form onSubmit={handleSearchSubmit} style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        gap: '15px', 
        alignItems: 'flex-end',
        justifyContent: 'space-between'
      }}>
        {/* Parameter 1: Content Query Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1', minWidth: '200px' }}>
          <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Keyword Content</label>
          <input 
            type="text" 
            placeholder="e.g., trash talk, practice..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem' }}
          />
        </div>

        {/* Parameter 2: DYNAMIC Dropdown Select Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1', minWidth: '200px' }}>
          <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Filter by Team</label>
          <select 
            value={teamTag} 
            onChange={(e) => setTeamTag(e.target.value)}
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem', height: '38px' }}
          >
            {teamOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Parameter 3: Author Text Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1', minWidth: '200px' }}>
          <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Author Username</label>
          <input 
            type="text" 
            placeholder="e.g., lebron, milk..."
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem' }}
          />
        </div>

        {/* Form Actions Deck */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            disabled={searching}
            style={{ 
              background: '#FDB927', color: '#000', border: 'none', 
              padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', 
              cursor: 'pointer', height: '38px', transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            {searching ? 'Filtering...' : 'Apply'}
          </button>

          <button 
            type="button"
            onClick={() => {
              setQuery('');
              setTeamTag('All Teams');
              setAuthorName('');
              api.getFeed().done((res) => onSearchResults(res.posts || res || []));
            }}
            style={{ 
              background: '#222', color: '#aaa', border: '1px solid #444', 
              padding: '10px 12px', borderRadius: '6px', fontWeight: 'bold', 
              cursor: 'pointer', height: '38px'
            }}
          >
            ✕
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvancedSearch;