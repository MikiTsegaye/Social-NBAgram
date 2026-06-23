const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
// 🛡️ Bring our security guard into the room!
const authMiddleware = require('../middleware/auth');

router.get('/by-name', authMiddleware, groupController.getLockerRoomByName);

// Create a new group (Needs a logged-in user!)
router.post('/groups', authMiddleware, groupController.createGroup);

// Get all groups
router.get('/groups', authMiddleware, groupController.getAllGroups);

// Search groups by name
router.get('/groups/search', authMiddleware, groupController.searchGroups);
// Get locker room data by team name
router.get('/groups/by-name', authMiddleware, groupController.getLockerRoomByName);
// Get group details by ID
router.get('/groups/:groupId', authMiddleware, groupController.getGroupById);

module.exports = router;