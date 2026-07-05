import React, { useState, useEffect, useRef } from 'react';
import api, { API_BASE_URL } from '../services/api';

export default function LockerRoomChat({ currentUser, socket, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [groupData, setGroupData] = useState(null);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const userTeam = currentUser?.favoriteTeam;

  // Fetch group data for the current user's team on mount
  useEffect(() => {
    if (!userTeam) return;

    setLoadingRoster(true);
    api.getLockerRoomByName(userTeam)
      .done((data) => {
        if (data) {
          console.log("👥 Live roster updated via centralized service wrapper:", data);
          setGroupData(data);
        }
      })
      .fail((xhr) => {
        console.error("❌ Failed to resolve team roster details:", xhr.status, xhr.responseJSON);
      })
      .always(() => {
        setLoadingRoster(false);
      });
  }, [userTeam]);

  useEffect(() => {
    if (!userTeam || !socket) return;

    const cleanRoomName = userTeam.trim().toLowerCase();

    // 1. 📂 FETCH PERSISTED RECORDS FROM MONGODB
    fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(cleanRoomName)}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch(err => console.error("Could not load database logs:", err));

    // 2. 📡 SIGN INTO THE RELEVANT SOCKET CHANNEL
    socket.emit('join_team', cleanRoomName);

    // 3. ⚡ LISTEN LIVE WITHOUT DISCONNECTING DROPS
    socket.on('receive_message', (messagePayload) => {
      const incomingTeam = (messagePayload.team || '').trim().toLowerCase();
      if (incomingTeam === cleanRoomName) {
        setMessages((prev) => [...prev, messagePayload]);
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [userTeam, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const messagePayload = {
      senderId: currentUser?._id || currentUser?.id,
      sender: currentUser?.username || 'Anonymous',
      text: input,
      team: userTeam.trim().toLowerCase()
    };

    socket.emit('send_message', messagePayload);
    setInput('');
  };

  return (
    <div className="locker-room-chat-container" style={{ background: '#111316', padding: '20px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', margin: '20px auto', maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#FDB927', margin: 0, fontFamily: 'NBAChampionship' }}>📢 {userTeam.toUpperCase()} TEAM LOCKER ROOM</h3>
        <button onClick={onBack} style={{ background: '#333', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>↩️ Return to Feed</button>
      </div>

      {/* Main Two-Column View Grid Container */}
      <div className="chat-and-stats-columns" style={{ display: 'flex', gap: '20px' }}>
        
        {/* ================= COLUMN 1: LIVE CHAT WINDOW ================= */}
        <div className="chat-column-box" style={{ flex: 2 }}>
          
          <div className="chat-messages-window" style={{ height: '300px', overflowY: 'auto', background: '#0a0a0c', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: '10px', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', textAlign: 'left' }}>
                <strong style={{ color: '#FDB927', marginRight: '8px' }}>@{msg.sender}:</strong>
                <span style={{ color: '#fff' }}>{msg.text}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              style={{ flex: 1, background: '#202429', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px' }}
              placeholder={`Broadcast live updates to the ${userTeam} locker room...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" style={{ background: '#e01e37', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
          </form>
        </div>

        {/* ================= COLUMN 2: SIDEBAR INTERFACE WRAPPER ================= */}
        <div className="sidebar-column-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Widget A: Stadium Sync Status Info */}
          <div className="leaderboard-column-box" style={{ background: '#16191d', padding: '15px', borderRadius: '8px', textAlign: 'left', margin: 0 }}>
            <h4 style={{ color: '#fff', marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '5px' }}>🏆 Stadium Sync</h4>
            <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Active Room: <strong style={{ color: '#FDB927' }}>{userTeam}</strong></p>
            <ul style={{ color: '#aaa', fontSize: '0.8rem', paddingLeft: '15px', lineHeight: '1.6', margin: 0 }}>
              <li>Every message is recorded directly onto the Mongo secure ledger.</li>
              <li>Websocket relays ensure instant cross-client updates.</li>
            </ul>
          </div>

          {/* Widget B: Active Roster Display Menu */}
          <div style={{ padding: '15px', background: '#16191d', borderRadius: '8px', textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 12px', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '5px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👥 Active Roster ({groupData?.members?.length || 1})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {loadingRoster ? (
                <p style={{ color: '#aaa', fontSize: '0.8rem', margin: 0 }}>Loading roster...</p>
              ) : groupData?.members && Array.isArray(groupData.members) && groupData.members.length > 0 ? (
                groupData.members.map((member) => {
                  const name = member?.username || member;
                  const isMe = String(name).toLowerCase() === String(currentUser?.username).toLowerCase();
                  return (
                    <div 
                      key={member._id || member}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: '#0a0a0c', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4caf50' }}></div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: isMe ? '#FDB927' : '#fff' }}>
                        @{name} {isMe && '(You)'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: '#0a0a0c', borderRadius: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4caf50' }}></div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#FDB927' }}>@{currentUser?.username} (You)</span>
                </div>
              )}
            </div>
          </div>

        </div> {/* Sidebar Ends */}
      </div> {/* Rows End */}
    </div>
  );
}