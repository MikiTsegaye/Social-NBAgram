import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './PostFeed.css';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formContent, setFormContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState({});

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

  const fetchFeed = () => {
    setLoading(true);
    api.getFeed()
      .done((data) => {
        setPosts(Array.isArray(data) ? data : data.posts || []);
      })
      .fail((xhr, status, err) => {
        setError(xhr.responseJSON?.message || `Unable to load feed: ${status}`);
      })
      .always(() => {
        setLoading(false);
      });
  };

  const currentUserId = currentUser?._id || currentUser?.id || '';

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
      .done(() => {
        setFormContent('');
        setMessage('Post created successfully.');
        setMediaUrl('');
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

  const handleUpdatePost = (postId) => {
    if (!editContent.trim()) {
      setError('Post content cannot be empty.');
      return;
    }

    if (!currentUserId) {
      setError('You must be logged in to edit a post.');
      return;
    }

    api.updatePost(postId, editContent.trim(), currentUserId)
      .done(() => {
        setMessage('Post updated successfully.');
        setEditMode(null);
        setEditContent('');
        fetchFeed();
      })
      .fail((xhr, status, err) => {
        setError(xhr.responseJSON?.message || `Update failed: ${status}`);
      });
  };

  const handleDeletePost = (postId) => {
    if (!window.confirm('Delete this post?')) {
      return;
    }

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

  return (
    <div className="post-feed-container">
      <div className="post-feed-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">NBA SOCIAL FEED</span>
            <h3>Share your latest locker room highlight</h3>
          </div>
          <span className="team-tag">{currentUser.favoriteTeam || 'No Team Selected'}</span>
        </div>

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
      </div>

      <div className="post-feed-grid">
        {loading && <div className="feed-status">Loading feed...</div>}
        {!loading && posts.length === 0 && (
          <div className="feed-status">No posts available. Create the first post.</div>
        )}

        {posts.map((post) => {
          const isOwner = post.author?._id === currentUserId || post.author?.id === currentUserId;
          const createdAt = new Date(post.createdAt).toLocaleString();

          return (
            <article key={post._id} className="post-card">
              <div className="post-card-header">
                <div>
                  <div className="post-author">{post.author?.username || 'Unknown Player'}</div>
                  <div className="post-meta">{post.teamTag || 'Team Feed'} · {createdAt}</div>
                </div>
                {isOwner && (
                  <div className="post-card-controls">
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
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default PostFeed;
