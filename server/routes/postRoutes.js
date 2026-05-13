const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Routes mapped to controllers
router.post('/posts', postController.createPost);
router.get('/posts', postController.getAllPosts);
router.post('/posts/:id/like', postController.toggleLike);
router.get('/posts/search', postController.searchPosts);
router.delete('/posts/:id', postController.deletePost);
router.put('/posts/:id', postController.updatePost);

module.exports = router;