// ========================================
// THE LEAGUE - JSON Response Format Guide
// ========================================
// This document shows the exact JSON format returned by all endpoints
// to ensure frontend compatibility and prevent crashes

// ========================================
// USER ENDPOINTS
// ========================================

// POST /api/auth/register
{
  "message": "User registered successfully",
  "user": {
    "_id": "ObjectId_string",
    "username": "playerName",
    "favoriteTeam": "Lakers",
    "isAdmin": false,
    "groups": [],
    "createdAt": "2026-05-20T10:30:00.000Z"
  }
}

// POST /api/auth/login
{
  "message": "Login successful",
  "user": {
    "_id": "ObjectId_string",
    "username": "playerName",
    "favoriteTeam": "Lakers",
    "isAdmin": false,
    "groups": ["groupId1", "groupId2"],
    "createdAt": "2026-05-20T10:30:00.000Z"
  }
}

// GET /api/users
{
  "message": "Users retrieved successfully",
  "users": [
    {
      "_id": "ObjectId_string",
      "username": "playerName",
      "favoriteTeam": "Lakers",
      "isAdmin": false,
      "groups": ["groupId1"],
      "createdAt": "2026-05-20T10:30:00.000Z"
    }
  ]
}

// GET /api/users/:userId
{
  "message": "User found",
  "user": {
    "_id": "ObjectId_string",
    "username": "playerName",
    "favoriteTeam": "Lakers",
    "isAdmin": false,
    "groups": ["groupId1"],
    "createdAt": "2026-05-20T10:30:00.000Z"
  }
}

// PUT /api/users/:userId
{
  "message": "User updated successfully",
  "user": {
    "_id": "ObjectId_string",
    "username": "newUsername",
    "favoriteTeam": "Lakers",
    "isAdmin": false,
    "groups": ["groupId1"],
    "createdAt": "2026-05-20T10:30:00.000Z"
  }
}

// GET /api/users/search?query=jordan&favoriteTeam=Lakers
{
  "message": "User search completed",
  "count": 2,
  "results": [
    {
      "_id": "ObjectId_string",
      "username": "jordan",
      "favoriteTeam": "Lakers",
      "isAdmin": false,
      "groups": ["groupId1"],
      "createdAt": "2026-05-20T10:30:00.000Z"
    }
  ]
}

// ========================================
// POST ENDPOINTS
// ========================================

// POST /api/posts (Create post)
{
  "message": "Post created successfully",
  "post": {
    "_id": "postId",
    "content": "Just made an amazing dunk!",
    "author": {
      "_id": "userId",
      "username": "jordan"
    },
    "likes": [],
    "teamTag": "Lakers",
    "createdAt": "2026-05-20T10:30:00.000Z"
  }
}

// GET /api/posts (Get all posts)
{
  "message": "Posts retrieved successfully",
  "count": 5,
  "posts": [
    {
      "_id": "postId",
      "content": "Just made an amazing dunk!",
      "author": {
        "_id": "userId",
        "username": "jordan"
      },
      "likes": ["userId2", "userId3"],
      "teamTag": "Lakers",
      "createdAt": "2026-05-20T10:30:00.000Z"
    }
  ]
}

// GET /api/posts/search?query=dunk&teamTag=Lakers
{
  "message": "Search completed",
  "count": 3,
  "results": [
    {
      "_id": "postId",
      "content": "Just made an amazing dunk!",
      "author": {
        "_id": "userId",
        "username": "jordan"
      },
      "likes": ["userId2"],
      "teamTag": "Lakers",
      "createdAt": "2026-05-20T10:30:00.000Z"
    }
  ]
}

// PUT /api/posts/:postId (Update post)
// Body: { "content": "new content", "userId": "userId", "userRole": "user" }
{
  "message": "Post updated successfully",
  "post": {
    "_id": "postId",
    "content": "Updated content",
    "author": {
      "_id": "userId",
      "username": "jordan"
    },
    "likes": ["userId2"],
    "teamTag": "Lakers",
    "createdAt": "2026-05-20T10:30:00.000Z"
  }
}

// DELETE /api/posts/:postId
// Body: { "userId": "userId", "userRole": "user" }
{
  "message": "Post deleted from The League"
}

// POST /api/posts/:postId/like
// Body: { "userId": "userId" }
{
  "message": "Post like status updated",
  "post": {
    "_id": "postId",
    "content": "Just made an amazing dunk!",
    "author": {
      "_id": "userId",
      "username": "jordan"
    },
    "likes": ["userId2", "userId"],
    "teamTag": "Lakers",
    "createdAt": "2026-05-20T10:30:00.000Z"
  }
}

// ========================================
// CRITICAL NOTES FOR FRONTEND
// ========================================
// 1. Always use '_id' (with underscore) - this is MongoDB's default
// 2. Never rely on 'id' without underscore
// 3. Author in posts is ALWAYS populated with _id and username
// 4. Password is NEVER returned in any response
// 5. User objects always have: _id, username, favoriteTeam, isAdmin, groups, createdAt
// 6. Post objects always have: _id, content, author, likes, teamTag, createdAt
// 7. Query parameters use 'favoriteTeam' (not 'team') and 'teamTag' for posts
