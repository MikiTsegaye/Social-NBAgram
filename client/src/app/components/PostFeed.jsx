import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './PostFeed.css';
import AdvancedSearch from './AdvancedSearch';

const PostFeed = ({ currentUser: initialUser, socket }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formContent, setFormContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(initialUser || {});
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (err) {
        setCurrentUser({});
      }
    }
    fetchFeed();
  }, []);

  // 📡 REAL-TIME EVENT STREAM LISTENER HOOK
  useEffect(() => {
    if (!socket) {
      console.warn("⚠️ PostFeed socket channel missing or uninitialized.");
      return;
    }

    console.log("📡 PostFeed real-time socket channel actively listening...");

    // Catch newly emitted posts from peer players immediately
    socket.on('receive_post', (incomingPost) => {
      console.log("📣 Fresh post intercepted live via socket:", incomingPost);
      if (!incomingPost || !incomingPost._id) return;

      setPosts((prevPosts) => {
        const postExists = prevPosts.some(p => p._id === incomingPost._id);
        if (postExists) return prevPosts;
        return [incomingPost, ...prevPosts];
      });
    });

    // Catch real-time comment discussions from peer windows!
    socket.on('receive_post_comment_update', (updatedCommentPayload) => {
      setPosts(prevPosts => prevPosts.map(p => {
        if (p._id === updatedCommentPayload.postId) {
          return { ...p, comments: updatedCommentPayload.comments };
        }
        return p;
      }));
    });

    // Clean up channel listener rules on component teardown unmount
    return () => {
      socket.off('receive_post');
      socket.off('receive_post_comment_update');
    };
  }, [socket]);

  const fetchFeed = () => {
    setLoading(true);
    setError('');
    
    api.getFeed()
      .done((data) => {
        if (data && data.posts) {
          setPosts(data.posts);
        } else if (Array.isArray(data)) {
          setPosts(data);
        } else {
          setPosts([]);
        }
      })
      .fail((xhr, status, err) => {
        setError(xhr.responseJSON?.message || `Unable to load feed: ${status}`);
      })
      .always(() => {
        setLoading(false);
      });
  };

  const currentUserId = currentUser?._id || currentUser?.id || '';
  const isCurrentUserAdmin = currentUser?.role === 'admin' || currentUser?.isAdmin === true;

  const handleCreatePost = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formContent.trim()) {
      setError('Post content cannot be empty.');
      return;
    }

    if (!currentUserId) {
      setError('You must be logged in to create a post.');
      return;
    }

    api.createPost(formContent.trim(), currentUser.favoriteTeam || '', currentUserId, mediaUrl?.trim() || '')
      .done((data) => {
        setFormContent('');
        setMessage('Post created successfully.');
        setMediaUrl('');
        
        const createdPost = data?.post || data;
        if (createdPost && socket) {
          socket.emit('send_post', createdPost);
        }
        fetchFeed(); 
      })
      .fail((xhr, status, err) => {
        setError(xhr.responseJSON?.message || `Create failed: ${status}`);
      });
  };

  const isVideoUrl = (url) => {
    if (!url) return false;
    const lowered = String(url).toLowerCase();
    return /\.mp4$|\.webm$|\.ogg$/.test(lowered) || lowered.includes('video');
  };

  const startEdit = (post) => {
    setEditMode(post._id);
    setEditContent(post.content);
    setError('');
    setMessage('');
  };

  const cancelEdit = () => {
    setEditMode(null);
    setEditContent('');
    setError('');
  };
  // Admins can edit any post, regular users can only edit their own
  const handleUpdatePost = (postId) => {
    if (!editContent.trim()) {
      setError('Post content cannot be empty.');
      return;
    }

    if (!currentUserId) {
      setError('You must be logged in to edit a post.');
      return;
    }

    api.updatePost(postId, editContent.trim(), currentUserId, currentUser.role || '')
      .done((data) => {
        setEditMode(null);
        setEditContent('');
        setMessage('Post updated successfully.');
        fetchFeed();
      })
      .fail((xhr, status, err) => {
        setError(xhr.responseJSON?.message || `Update failed: ${status}`);
      });
  };

  const handleDeletePost = (postId) => {
    if (!window.confirm('Delete this post?')) return;
    if (!currentUserId) {
      setError('You must be logged in to delete a post.');
      return;
    }

    api.deletePost(postId, currentUserId)
      .done(() => {
        setMessage('Post removed successfully.');
        fetchFeed();
      })
      .fail((xhr, status, err) => {
        setError(xhr.responseJSON?.message || `Delete failed: ${status}`);
      });
  };

  const handleLikeToggle = (postId) => {
    if (!currentUserId) {
      setError('You must be logged in to like posts.');
      return;
    }

    api.toggleLike(postId)
      .done((response) => {
        const updatedLikes = response?.post?.likes || [];
        setPosts(prevPosts => prevPosts.map(p => {
          if (p._id === postId) {
            return { ...p, likes: updatedLikes };
          }
          return p;
        }));
        
        if (socket) {
          socket.emit('send_post_update', { postId, likes: updatedLikes });
        }
      })
      .fail((xhr) => {
        console.error("❌ Toggle like system request error:", xhr.responseJSON?.message);
      });
  };

  const handleCommentSubmit = (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId] || '';

    if (!commentText.trim()) return;
    if (!currentUserId) {
      setError('You must be logged in to comment.');
      return;
    }

    api.createComment(postId, commentText.trim())
      .done((response) => {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        setPosts(prevPosts => prevPosts.map(p => {
          if (p._id === postId) {
            return { ...p, comments: response.comments || [] };
          }
          return p;
        }));

        if (socket) {
          socket.emit('send_post_comment_update', { postId, comments: response.comments || [] });
        }
      })
      .fail((xhr) => {
        console.error("❌ Comment creation processing failed:", xhr.responseJSON?.message);
      });
  };
  
  const handleDeleteComment = (postId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    api.deleteComment(postId, commentId)
      .done((response) => {
        setPosts(prevPosts => prevPosts.map(p => {
          if (p._id === postId) {
            return { ...p, comments: response.comments || [] };
          }
          return p;
        }));

        if (socket) {
          socket.emit('send_post_comment_update', { postId, comments: response.comments || [] });
        }
      })
      .fail((xhr) => {
        console.error("❌ Comment deletion failed:", xhr.responseJSON?.message);
      });
  };

  return (
    <div className="post-feed-container">
      {/* 🏀 POST CREATION BOX ELEMENT */}
      <div className="post-feed-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">NBA SOCIAL FEED</span>
            <h3>Share your latest locker room highlight</h3>
          </div>
          <span className="team-tag">{currentUser.favoriteTeam || 'No Team Selected'}</span>
        </div>

        {/* 🛡️ WATCHER ACCESS CONTROL GUARD RULE #2 */}
        {currentUser.role === 'watcher' ? (
          <div style={{ background: '#1c1f24', padding: '20px', borderRadius: '12px', textAlign: 'center', margin: '20px 0', border: '1px solid #ce1141' }}>
            <h4 style={{ color: '#ce1141', margin: '0 0 8px 0' }}>🔒 READ-ONLY MODE (WATCHER)</h4>
            <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>You must request access and be approved by a Team Captain to post or message in locker rooms.</p>
          </div>
        ) : (
          <form className="post-feed-form" onSubmit={handleCreatePost}>
            <textarea
              className="post-feed-textarea"
              placeholder="Share a play, trash talk, or team news..."
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              rows={4}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ color: '#cfcfcf', fontSize: '0.9rem' }}>Media URL (Image or Video)</label>
              <input
                type="text"
                className="post-media-input"
                placeholder="https://example.com/media.mp4 or image.jpg"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
            </div>

            <div className="post-feed-actions">
              <button type="submit" className="post-feed-button primary">
                Post to Feed
              </button>
              <button
                type="button"
                className="post-feed-button secondary"
                onClick={() => { setFormContent(''); setMediaUrl(''); }}
              >
                Clear
              </button>
            </div>

            {message && <p className="feed-message success">{message}</p>}
            {error && <p className="feed-message error">{error}</p>}
          </form>
        )}
      </div>

      {/* 🔎 ADVANCED SEARCH CONTROLLER BAR CONTAINER */}
      <div style={{ width: '100%', marginBottom: '25px' }}>
        <AdvancedSearch onSearchResults={(filteredResults) => setPosts(filteredResults)} />
      </div>

      {/* 📰 FEED TIMELINE GRID */}
      <div className="post-feed-grid">
        {loading && <div className="feed-status">Loading feed...</div>}
        {!loading && posts.length === 0 && (
          <div className="feed-status">No posts available. Create the first post.</div>
        )}
        
        {!loading && posts.map((post) => {
          if (!post) return null;
                
          const authorObject = post.author || {};
          const authorId = authorObject._id || authorObject.id || '';
          const isOwner = authorId === currentUserId && currentUserId !== '';
          const canManagePost = isOwner || isCurrentUserAdmin;
          const isAdminManagingOtherPost = !isOwner && isCurrentUserAdmin;
          const createdAt = post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Recent';
                
          return (
            <article key={post._id} className="post-card">
              <div className="post-card-header">
                <div>
                  <div className="post-author">@{authorObject.username || 'Unknown Player'}</div>
                  <div className="post-meta">{post.teamTag || 'Team Feed'} · {createdAt}</div>
                </div>
                {canManagePost && (
                  <div className="post-card-controls">
                    {isAdminManagingOtherPost && <span className="admin-badge" title="You are managing another user's post">⭐ ADMIN</span>}
                    <button className="control-button edit" onClick={() => startEdit(post)}>
                      {editMode === post._id ? 'Editing' : 'Edit'}
                    </button>
                    <button className="control-button delete" onClick={() => handleDeletePost(post._id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
              
              <div className="post-card-content">
                {editMode === post._id ? (
                  <>
                    <textarea
                      className="post-feed-textarea edit"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                    />
                    <div className="post-feed-actions post-card-edit-actions">
                      <button className="post-feed-button primary" onClick={() => handleUpdatePost(post._id)}>
                        Save
                      </button>
                      <button className="post-feed-button secondary" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>{post.content}</p>
                    {post.mediaUrl && (
                      isVideoUrl(post.mediaUrl) ? (
                        <video
                          src={post.mediaUrl}
                          controls
                          width="100%"
                          className="post-media"
                          style={{ borderRadius: '8px', marginTop: '10px' }}
                        />
                      ) : (
                        <img
                          src={post.mediaUrl}
                          alt="Post media"
                          className="post-media"
                          style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }}
                        />
                      )
                    )}
                  </>
                )}
              </div>

              {/* ❤️ LIKES & DISCUSSIONS FOOTER WRAPPER */}
              <div className="post-card-footer" style={{ 
                marginTop: '15px', 
                paddingTop: '10px', 
                borderTop: '1px solid #222' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <button 
                    onClick={() => handleLikeToggle(post._id)}
                    style={{
                      background: Array.isArray(post.likes) && post.likes.includes(currentUserId) ? '#ff1744' : '#222',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {Array.isArray(post.likes) && post.likes.includes(currentUserId) ? '❤️ Liked' : '🤍 Like'} 
                    <span style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>
                      {Array.isArray(post.likes) ? post.likes.length : 0}
                    </span>
                  </button>
                  <span style={{ color: '#aaa', fontSize: '0.85rem' }}>
                    💬 {post.comments ? post.comments.length : 0} Replies
                  </span>
                </div>

                {/* 💬 NESTED COMMENTS PANEL */}
                <div className="post-comments-section" style={{ background: '#0a0a0c', borderRadius: '8px', padding: '12px' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#aaa', fontSize: '0.85rem' }}>Discussion Channel</h5>
                  
                  {/* Comments History Display */}
                  <div className="comments-stream" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(!post.comments || post.comments.length === 0) && (
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#555', fontStyle: 'italic' }}>No remarks dropped yet. Call the play!</p>
                    )}
                    {post.comments && post.comments.map((comment, idx) => {
                      const commentAuthorId = comment.author?._id || comment.author || '';
                      const isCommentOwner = String(commentAuthorId) === String(currentUserId);
                      const canDeleteComment = isCommentOwner || isCurrentUserAdmin;
                      const isAdminDeletingOtherComment = !isCommentOwner && isCurrentUserAdmin;

                      return (
                        <div key={comment._id || idx} style={{ 
                          background: '#121418', padding: '8px 10px', borderRadius: '6px', border: '1px solid #222', 
                          fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' 
                        }}>
                          <div style={{ flex: 1, textAlign: 'left' }}>
                            <strong style={{ color: '#FDB927' }}>@{comment.username}</strong>
                            <span style={{ color: '#bbb', fontSize: '0.75rem', marginLeft: '8px' }}>
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                            <p style={{ margin: '4px 0 0 0', color: '#e0e0e0' }}>{comment.text}</p>
                          </div>

                          {/* 🗑️ Trash action handle */}
                          {canDeleteComment && comment._id && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {isAdminDeletingOtherComment && (
                                <span style={{ fontSize: '0.65rem', color: '#FDB927', fontWeight: 'bold' }}>⭐</span>
                              )}
                              <button
                                onClick={() => handleDeleteComment(post._id, comment._id)}
                                style={{ background: 'transparent', color: '#666', border: 'none', fontSize: '1.1rem', cursor: 'pointer', padding: '0 4px', transition: 'color 0.2s' }}
                                onMouseEnter={(e) => e.target.style.color = '#ce1141'}
                                onMouseLeave={(e) => e.target.style.color = '#666'}
                                title={isAdminDeletingOtherComment ? 'Delete comment (as admin)' : 'Delete comment'}
                              >
                              &times;
                            </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit New Reply Input form */}
                  <form onSubmit={(e) => handleCommentSubmit(e, post._id)} style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text"
                      placeholder="Drop a remark or drop some heat..."
                      value={commentInputs[post._id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                      style={{ flex: 1, background: '#121418', border: '1px solid #333', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.88rem' }}
                    />
                    <button type="submit" style={{ background: '#333', color: '#FDB927', border: '1px solid #444', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                      Reply
                    </button>
                  </form>
                </div>
              </div>

            </article>
          );
        })}
      </div>
    </div>
  );
};

export default PostFeed;