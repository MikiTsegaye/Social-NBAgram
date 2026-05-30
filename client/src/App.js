import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import LockerRoom from './pages/LockerRoom';
import TeamStatsPieChart from './app/components/TeamStatsPieChart';
import PostEngagementBarChart from './app/components/PostEngagementBarChart';
import PostFeed from './app/components/PostFeed';
import api from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Fetch groups when user logs in
  useEffect(() => {
    if (user && groups.length === 0) {
      setLoadingGroups(true);
      api.getAllGroups()
        .done((data) => {
          setGroups(Array.isArray(data) ? data : data.groups || []);
        })
        .fail(() => {
          setGroups([]);
        })
        .always(() => {
          setLoadingGroups(false);
        });
    }
  }, [user, groups.length]);

  // If viewing a specific locker room
  if (user && selectedGroupId) {
    return (
      <LockerRoom 
        groupId={selectedGroupId} 
        onBack={() => setSelectedGroupId(null)}
      />
    );
  }

  // If user is logged in, show groups dashboard
  if (user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        padding: '30px 20px', 
        background: '#0a0a0a', 
        color: '#ffffff' 
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#FDB927' }}>THE LEAGUE</h1>
              <p style={{ margin: '8px 0 0', opacity: 0.7 }}>Welcome, {user.username} ({user.favoriteTeam})</p>
            </div>
            <button 
              onClick={() => { 
                setUser(null); 
                setSelectedGroupId(null);
                setGroups([]);
                localStorage.clear(); 
              }}
              style={{
                padding: '10px 20px',
                background: '#ce1141',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Logout
            </button>
          </header>

          <section>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#FDB927' }}>Your Locker Rooms</h2>
            {loadingGroups && <p>Loading locker rooms...</p>}
            
            {!loadingGroups && groups.length === 0 && (
              <div style={{
                padding: '30px',
                background: '#1a1a1a',
                borderRadius: '12px',
                border: '1px solid #333',
                textAlign: 'center'
              }}>
                <p style={{ opacity: 0.7 }}>No locker rooms available. Check back soon!</p>
              </div>
            )}

            {!loadingGroups && groups.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {groups.filter(group => 
                  Array.isArray(group.members) && group.members.includes(user._id)
                ).map((group) => (
                  <div
                    key={group._id}
                    style={{
                      padding: '20px',
                      background: '#1a1a1a',
                      borderRadius: '12px',
                      border: '1px solid #333',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      hover: { background: '#252525', borderColor: '#FDB927' }
                    }}
                    onClick={() => setSelectedGroupId(group._id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#252525';
                      e.currentTarget.style.borderColor = '#eb1111';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#1a1a1a';
                      e.currentTarget.style.borderColor = '#eb1111';
                    }}
                  >
                    <h3 style={{ margin: '0 0 10px', color: '#FDB927' }}>{group.name}</h3>
                    <p style={{ margin: '0 0 15px', opacity: 0.7, fontSize: '0.9rem' }}>{group.description}</p>
                    <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                      <p style={{ margin: '4px 0' }}>Members: {Array.isArray(group.members) ? group.members.length : 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          
          <section style={{ marginTop: '60px' }}>
            <PostFeed />
          </section>

          <section style={{ marginTop: '60px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '40px', color: '#FDB927' }}>Your Team Analytics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '40px' }}>
              <div>
                <TeamStatsPieChart team={user.favoriteTeam} />
              </div>
              <div>
                <PostEngagementBarChart team={user.favoriteTeam} />
              </div>
            </div>
          </section>

        </div>
      </div>
    );
  }

  return showRegister ? (
    <Register onSwitchToLogin={() => setShowRegister(false)} />
  ) : (
    <Login onLoginSuccess={(u) => setUser(u)} onSwitchToRegister={() => setShowRegister(true)} />
  );
}

export default App;