import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AdminPanel = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // all, admin, user

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    setError('');
    
    api.getAllUsers()
      .done((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data && data.users) {
          setUsers(data.users);
        } else {
          setUsers([]);
        }
      })
      .fail((xhr, status, err) => {
        setError(xhr.responseJSON?.message || `Failed to load users: ${status}`);
      })
      .always(() => {
        setLoading(false);
      });
  };

  const handlePromoteUser = (userId, username) => {
    if (!window.confirm(`Promote ${username} to admin?`)) return;

    api.promoteUserToAdmin(userId)
      .done((data) => {
        setMessage(`${username} has been promoted to admin.`);
        fetchUsers();
      })
      .fail((xhr) => {
        setError(xhr.responseJSON?.message || 'Failed to promote user');
      });
  };

  const handleDemoteAdmin = (userId, username) => {
    if (!window.confirm(`Demote ${username} to regular user?`)) return;

    api.demoteAdminToUser(userId)
      .done((data) => {
        setMessage(`${username} has been demoted to regular user.`);
        fetchUsers();
      })
      .fail((xhr) => {
        setError(xhr.responseJSON?.message || 'Failed to demote admin');
      });
  };

  const filteredUsers = users.filter(user => {
    if (filterRole === 'admin') return user.role === 'admin' || user.isAdmin === true;
    if (filterRole === 'user') return user.role !== 'admin' && user.isAdmin !== true;
    return true;
  });

  const currentUserId = currentUser?._id || currentUser?.id || '';

  return (
    <div style={{ 
      background: 'linear-gradient(180deg, #070809 0%, #121418 100%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '20px',
      padding: '26px',
      boxShadow: '0 18px 50px rgba(0, 0, 0, 0.45)',
      color: '#f1f1f1',
    }}>
      <div style={{ marginBottom: '30px' }}>
        <span style={{ 
          display: 'inline-block',
          fontSize: '0.8rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#fdb927',
          marginBottom: '10px'
        }}>Admin Controls</span>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem', color: '#ffffff' }}>
          ⚙️ User Management
        </h2>
        <p style={{ margin: 0, color: '#aaa', fontSize: '0.95rem' }}>
          Promote or demote users to/from admin status
        </p>
      </div>

      {/* Filter Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setFilterRole('all')}
          style={{
            background: filterRole === 'all' ? '#fdb927' : '#222',
            color: filterRole === 'all' ? '#000' : '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            transition: 'all 0.2s'
          }}
        >
          All Users ({users.length})
        </button>
        <button
          onClick={() => setFilterRole('admin')}
          style={{
            background: filterRole === 'admin' ? '#fdb927' : '#222',
            color: filterRole === 'admin' ? '#000' : '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            transition: 'all 0.2s'
          }}
        >
          Admins ({users.filter(u => u.role === 'admin' || u.isAdmin === true).length})
        </button>
        <button
          onClick={() => setFilterRole('user')}
          style={{
            background: filterRole === 'user' ? '#fdb927' : '#222',
            color: filterRole === 'user' ? '#000' : '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            transition: 'all 0.2s'
          }}
        >
          Regular Users ({users.filter(u => u.role !== 'admin' && u.isAdmin !== true).length})
        </button>
      </div>

      {/* Status Messages */}
      {error && <p style={{ color: '#ff8a8a', marginBottom: '15px', fontSize: '0.95rem' }}>❌ {error}</p>}
      {message && <p style={{ color: '#7efc7e', marginBottom: '15px', fontSize: '0.95rem' }}>✅ {message}</p>}

      {/* Loading State */}
      {loading && <p style={{ textAlign: 'center', color: '#aaa' }}>Loading users...</p>}

      {/* Users Table */}
      {!loading && filteredUsers.length === 0 && (
        <div style={{
          padding: '20px',
          background: '#111316',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#aaa'
        }}>
          No users found.
        </div>
      )}

      {!loading && filteredUsers.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.95rem'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#fdb927', fontWeight: 'bold' }}>Username</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#fdb927', fontWeight: 'bold' }}>Team</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#fdb927', fontWeight: 'bold' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#fdb927', fontWeight: 'bold' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isAdmin = user.role === 'admin' || user.isAdmin === true;
                const isCurrentUser = user._id === currentUserId;

                return (
                  <tr key={user._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '12px', color: '#e0e0e0' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {user.username}
                        {isCurrentUser && <span style={{ fontSize: '0.75rem', color: '#fdb927', fontWeight: 'bold' }}>(YOU)</span>}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#aaa' }}>
                      {user.favoriteTeam || 'N/A'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        background: isAdmin ? 'rgba(253, 185, 39, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: isAdmin ? '#fdb927' : '#aaa'
                      }}>
                        {isAdmin ? '⭐ Admin' : 'Regular'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {!isCurrentUser && (
                        isAdmin ? (
                          <button
                            onClick={() => handleDemoteAdmin(user._id, user.username)}
                            style={{
                              background: 'rgba(206, 17, 65, 0.2)',
                              color: '#ff6b75',
                              border: '1px solid rgba(206, 17, 65, 0.4)',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '0.85rem',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(206, 17, 65, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(206, 17, 65, 0.2)';
                            }}
                          >
                            Demote
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePromoteUser(user._id, user.username)}
                            style={{
                              background: 'rgba(253, 185, 39, 0.2)',
                              color: '#fdb927',
                              border: '1px solid rgba(253, 185, 39, 0.4)',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '0.85rem',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(253, 185, 39, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(253, 185, 39, 0.2)';
                            }}
                          >
                            Promote
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
