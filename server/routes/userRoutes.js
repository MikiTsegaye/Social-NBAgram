const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// 🛡️ Bring our security guard into the room!
const authMiddleware = require('../middleware/auth');

// User search route (Protected by our security guard!)
router.get('/users/search', authMiddleware, userController.searchUsers);

// User CRUD routes (Protected by our security guard!)
router.get('/users', authMiddleware, userController.getAllUsers); // Read all users
router.get('/users/:userId', authMiddleware, userController.getUserById); // Read single user
router.put('/users/:userId', authMiddleware, userController.updateUser); // Update user
router.delete('/users/:userId', authMiddleware, userController.deleteUser); // Delete user

module.exports = router;