import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import './PostFeed.css';

const API_URL = 'http://localhost:5000/api';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formContent, setFormContent] = useState('');
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
    const token = localStorage.getItem('token');

    $.ajax({
      url: `${API_URL}/posts/feed`,
      method: 'GET',
      dataType: 'json',
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
    })
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

    const token = localStorage.getItem('token');
    const payload = {
      content: formContent.trim(),
      teamTag: currentUser.favoriteTeam || '',
    };

    $.ajax({
      url: `${API_URL}/posts`,
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
    })
      .done(() => {
        setFormContent('');
        setMessage('Post created successfully.');
        fetchFeed();
      })
      .fail((xhr, status, err) => {
        setError(xhr.responseJSON?.message || `Create failed: ${status}`);
      });
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

    const token = localStorage.getItem('token');

    $.ajax({
      url: `${API_URL}/posts/${postId}`,
      method: 'PUT',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({ content: editContent.trim() }),
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
    })
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

    const token = localStorage.getItem('token');

    $.ajax({
      url: `${API_URL}/posts/${postId}`,
      method: 'DELETE',
      dataType: 'json',
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
    })
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

          <div className="post-feed-actions">
            <button type="submit" className="post-feed-button primary">
              Post to Feed
            </button>
            <button
              type="button"
              className="post-feed-button secondary"
              onClick={() => setFormContent('')}
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
                  <p>{post.content}</p>
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
