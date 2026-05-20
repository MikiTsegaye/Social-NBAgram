const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User search route (must come before /:userId to avoid conflicts)
router.get('/users/search', userController.searchUsers);

// User CRUD routes
router.get('/users', userController.getAllUsers); // Read all users
router.get('/users/:userId', userController.getUserById); // Read single user
router.put('/users/:userId', userController.updateUser); // Update user
router.delete('/users/:userId', userController.deleteUser); // Delete user

module.exports = router;
