const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
// 🛡️ Grab our security guard to protect our chats!
const authMiddleware = require('../middleware/auth');

// 🏀 Route 1: Get messages for a specific locker room team chat
router.get('/messages/group/:groupId', authMiddleware, messageController.getGroupMessages);

// 🔒 Route 2: Get private messages with a specific player user
router.get('/messages/personal/:otherUserId', authMiddleware, messageController.getPersonalMessages);

// 📝 Route 3: Send/Save a chat record manually
router.post('/messages', authMiddleware, messageController.sendMessage);

module.exports = router;