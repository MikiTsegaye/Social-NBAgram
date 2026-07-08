const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
// 🛡️ Bring our security guard into the room!
const authMiddleware = require('../middleware/auth');

// Routes mapped to controllers (Now protected by our security guard!)
router.post('/posts', authMiddleware, postController.createPost);
router.get('/posts', authMiddleware, postController.getAllPosts);
router.post('/posts/:id/like', authMiddleware, postController.toggleLike);
router.get('/posts/search', authMiddleware, postController.searchPosts);
router.delete('/posts/:id', authMiddleware, postController.deletePost);
router.put('/posts/:id', authMiddleware, postController.updatePost);
router.post('/posts/:id/comment', authMiddleware, postController.addComment);
router.put('/posts/:postId/comment/:commentId', authMiddleware, postController.updateComment);
router.delete('/posts/:postId/comment/:commentId', authMiddleware, postController.deleteComment);

module.exports = router;