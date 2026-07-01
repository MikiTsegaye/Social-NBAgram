import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import LockerRoom from './pages/LockerRoom';
import AdminPanel from './pages/AdminPanel';
import TeamStatsPieChart from './app/components/TeamStatsPieChart';
import PostEngagementBarChart from './app/components/PostEngagementBarChart';
import PostFeed from './app/components/PostFeed';
import api from './services/api';
import TacticalBoard from './app/components/TacticalBoard';
import LockerRoomChat from './pages/LockerRoomChat';
import DirectMessages from './pages/DirectMessages';
import { io } from 'socket.io-client';

// 📡 Initialize single persistent global socket channel outside component cycles
const globalSocket = io('http://localhost:5000');

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [currentView, setCurrentView] = useState('feed'); // values: 'feed', 'chat', 'dms', 'admin'

  // 📈 Track scrolling position to show/hide the floating action back-to-top button
  const [showFloatingNav, setShowFloatingNav] = useState(false);

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

  // Track window scroll coordinates dynamically
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowFloatingNav(true);
      } else {
        setShowFloatingNav(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
          
          {/* ================== PERSISTENT HEADER ELEMENT ================== */}
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

          {/* ================== NAVIGATION CONTROLLER BAR ================== */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0', flexWrap: 'wrap' }}>
            <button onClick={() => setCurrentView('feed')} style={{ background: currentView === 'feed' ? '#FDB927' : '#222', color: currentView === 'feed' ? '#000' : '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📰 News Feed</button>
            <button onClick={() => setCurrentView('chat')} style={{ background: currentView === 'chat' ? '#FDB927' : '#222', color: currentView === 'chat' ? '#000' : '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📢 Team Locker Chat</button>
            <button onClick={() => setCurrentView('dms')} style={{ background: currentView === 'dms' ? '#FDB927' : '#222', color: currentView === 'dms' ? '#000' : '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🔒 Direct Messages</button>
            {(user?.role === 'admin' || user?.isAdmin === true) && (
              <button onClick={() => setCurrentView('admin')} style={{ background: currentView === 'admin' ? '#ffd700' : '#333', color: currentView === 'admin' ? '#000' : '#fdb927', border: '2px solid #fdb927', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>⚙️ Admin Panel</button>
            )}
          </div>

          {/* ================== QUICK JUMP ANCHOR LINK BAR ================== */}
          {currentView === 'feed' && (
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              justifyContent: 'center', 
              margin: '10px 0 25px 0',
              padding: '10px',
              background: '#111316',
              borderRadius: '8px',
              border: '1px solid #222'
            }}>
              <span style={{ color: '#aaa', fontSize: '0.9rem', alignSelf: 'center' }}>⚡ Quick Jump:</span>
              <a href="#team-analytics" style={{ color: '#FDB927', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>
                🏆 Go to Analytics
              </a>
              <span style={{ color: '#444' }}>|</span>
              <a href="#tactical-board" style={{ color: '#FDB927', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>
                📋 Go to Tactical Board
              </a>
            </div>
          )}

          {/* ================== VIEW PANELS CONDITIONAL LAYER ================== */}
          
          {currentView === 'feed' && (
            <>
              {/* 🏀 Tab 1: Your original full main dashboard content */}
              <section>
                <h2 className="championship-title" style={{ fontSize: '1.8rem', marginBottom: '20px' }}>
                  🏀 NBA Locker Rooms 🏀
                </h2>
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
                    {groups.filter(group => {
                      const currentUserId = user?._id || user?.id;
                      return Array.isArray(group.members) && group.members.includes(currentUserId);
                    }).map((group) => (
                      <div
                        key={group._id}
                        style={{
                          padding: '20px',
                          background: '#1a1a1a',
                          borderRadius: '12px',
                          border: '1px solid #333',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onClick={() => setSelectedGroupId(group._id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#252525';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#1a1a1a';
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
                <PostFeed currentUser={user} socket={globalSocket} />
              </section>

              {/* 🏆 Added dynamic identifier target for top quick link matching hooks */}
              <section id="team-analytics" style={{ marginTop: '60px', scrollMarginTop: '20px' }}>
                <h2 className="championship-title" style={{ fontSize: '1.8rem', marginBottom: '40px' }}>
                  🏆 Your Team Analytics
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                  <div>
                    <TeamStatsPieChart team={user.favoriteTeam} />
                  </div>
                  <div>
                    <PostEngagementBarChart team={user.favoriteTeam} />
                  </div>
                </div>
              </section>

              {/* 📋 Added dynamic identifier target for top quick link matching hooks */}
              <section id="tactical-board" style={{ marginTop: '60px', scrollMarginTop: '20px' }}>
                <TacticalBoard />
              </section>
            </>
          )}
          
          {currentView === 'chat' && (
            <LockerRoomChat 
              currentUser={user} 
              socket={globalSocket} 
              onBack={() => setCurrentView('feed')} 
              groupId={selectedGroupId || user.groups?.[0] || user.approvedTeamId} // 👈 FORWARD THE GROUP ID HERE
            />
          )}

          {currentView === 'dms' && (
            <DirectMessages currentUser={user} socket={globalSocket} onBack={() => setCurrentView('feed')} />
          )}

          {currentView === 'admin' && (
            <AdminPanel currentUser={user} />
          )}

          {/* ================== FLOATING PERSISTENT NAV BUTTON ================== */}
          {showFloatingNav && currentView === 'feed' && (
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                zIndex: 1000,
                background: '#FDB927', // Lakers Gold
                color: '#0a0a0a',
                border: 'none',
                width: '50px',
                height: '50px',
                borderRadius: '50%', // Perfect circle
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
              }}
              title="Scroll to Top"
            >
              ▲
            </button>
          )}

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