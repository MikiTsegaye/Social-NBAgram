const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/auth');

router.get('/messages/personal/:otherUserId', authMiddleware, messageController.getPersonalMessages);
router.get('/messages/:teamName', messageController.getTeamMessages);
router.post('/messages', authMiddleware, messageController.sendMessage);

module.exports = router;