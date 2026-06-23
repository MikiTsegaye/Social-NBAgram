import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function DirectMessages({ currentUser, socket, onBack }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const myId = currentUser?._id || currentUser?.id;

  // 1. Fetch active player rosters to list on the left panel
  useEffect(() => {
    if (typeof api.getAllUsers === 'function') {
      api.getAllUsers()
        .done((data) => {
          // Unpack from either a raw array or an object property envelope wrapper
          const rawUsers = Array.isArray(data) ? data : data.users || [];
          
          // Filter out our own logged-in profile from the available panel options
          const filtered = rawUsers.filter(u => u.username !== currentUser?.username);
          setUsers(filtered);
        })
        .fail((err) => {
          console.error("❌ Failed to pull roster via api helper, loading test defaults:", err);
        });
    }

  }, [currentUser]);

  // 2. Sync direct message ledger history when an active player profile is clicked
  useEffect(() => {
    if (!selectedUser || !socket) return;

    const token = localStorage.getItem('token');
    const otherId = selectedUser._id;

    // Fetch previous conversational threads safely from the database
    fetch(`http://localhost:5000/api/messages/personal/${otherId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch(err => console.error("Could not sync DM ledger history:", err));

    // 3. Listen live using the shared global socket pipeline
    socket.on('receive_message', (messagePayload) => {
      // Filter criteria: message contains no team room ID property (meaning it's a private DM)
      if (!messagePayload.team) {
        const isFromMe = messagePayload.senderId === myId && messagePayload.receiverId === otherId;
        const isToMe = messagePayload.senderId === otherId && messagePayload.receiverId === myId;
        
        if (isFromMe || isToMe) {
          setMessages(prev => [...prev, messagePayload]);
        }
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [selectedUser, socket, myId]);

  // Auto-scroll layout window on fresh transmissions
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendDM = (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;

    // Shape payload signatures to match backend expectations exactly
    const dmPayload = {
      senderId: myId,
      sender: currentUser?.username || 'Anonymous',
      receiverId: selectedUser._id,
      text: input.trim()
    };

    // 📡 1. Emit live transmission across the socket cluster
    socket.emit('send_message', dmPayload);
    
    // ❌ REMOVED: setMessages(prev => [...prev, ...]) 
    // This manual insertion was causing the visual duplicate copy!
    
    setInput('');
  };

  return (
    <div className="locker-room-chat-container" style={{ background: '#111316', padding: '20px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', margin: '20px auto', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#FDB927', margin: 0, fontFamily: 'NBAChampionship' }}>🔒 PLAYER DIRECT MESSAGES</h3>
        <button onClick={onBack} style={{ background: '#333', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>↩️ Return to Feed</button>
      </div>

      <div className="chat-and-stats-columns" style={{ display: 'flex', gap: '20px' }}>
        {/* Left Hand Roster Contact Box Column */}
        <div className="leaderboard-column-box" style={{ flex: 1, background: '#16191d', padding: '15px', borderRadius: '8px', maxHeight: '350px', overflowY: 'auto' }}>
          <h4 style={{ color: '#fff', marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '5px' }}>Active Players</h4>
          {users.map(u => (
            <div 
              key={u._id} 
              onClick={() => setSelectedUser(u)}
              style={{
                padding: '10px', margin: '5px 0', 
                background: selectedUser?._id === u._id ? 'rgba(253, 185, 39, 0.15)' : '#202429',
                borderLeft: selectedUser?._id === u._id ? '4px solid #FDB927' : '4px solid transparent',
                borderRadius: '4px', cursor: 'pointer', textAlign: 'left'
              }}
            >
              <strong style={{ color: '#fff' }}>@{u.username}</strong>
              <div style={{ fontSize: '0.75rem', color: '#aaa' }}>Team: {u.favoriteTeam}</div>
            </div>
          ))}
        </div>

        {/* Right Hand Live Dialog Message Stream Column */}
        <div className="chat-column-box" style={{ flex: 2, background: '#16191d', padding: '15px', borderRadius: '8px', height: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {selectedUser ? (
            <>
              <div style={{ color: '#aaa', fontSize: '0.85rem', paddingBottom: '5px', borderBottom: '1px solid #222', textAlign: 'left' }}>
                Private Stream with <strong style={{ color: '#fff' }}>@{selectedUser.username}</strong>
              </div>
              
              <div className="chat-messages-window" style={{ flex: 1, margin: '10px 0', background: '#0a0a0c', borderRadius: '8px', padding: '10px', overflowY: 'auto' }}>
                {messages.map((msg, i) => {
                  const isMe = msg.senderId === myId || msg.sender === currentUser?.username || msg.senderName === currentUser?.username;
                  return (
                    <div key={i} style={{ marginBottom: '10px', padding: '6px 10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', textAlign: 'left' }}>
                      <strong style={{ color: isMe ? '#FDB927' : '#fff', marginRight: '8px' }}>
                        @{isMe ? currentUser.username : selectedUser.username}:
                      </strong>
                      <span style={{ color: '#fff' }}>{msg.content || msg.text}</span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendDM} style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  style={{ flex: 1, background: '#202429', border: '1px solid #333', color: '#fff', padding: '8px', borderRadius: '6px' }} 
                  placeholder={`Send private message to @${selectedUser.username}...`} 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                />
                <button type="submit" style={{ background: '#ff1744', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
              </form>
            </>
          ) : (
            <div style={{ color: '#666', margin: 'auto' }}>🎯 Select an active player profile from the list to open an encrypted conversation feed.</div>
          )}
        </div>
      </div>
    </div>
  );
}