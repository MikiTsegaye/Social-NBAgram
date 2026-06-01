const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Create a new group
router.post('/groups', groupController.createGroup);

// Get all groups
router.get('/groups', groupController.getAllGroups);

// Search groups by name
router.get('/groups/search', groupController.searchGroups);

// Request to join a group (user sends request)
router.post('/groups/:groupId/request', groupController.requestToJoinGroup);

// Get pending requests for a group (admin only)
router.get('/groups/:groupId/pending-requests', groupController.getPendingRequests);

// Get group details by ID
router.get('/groups/:groupId', groupController.getGroupById);

// Get group details by ID
router.get('/groups/:groupId', groupController.getGroupById);

// Admin: Approve join request
router.post('/groups/:groupId/approve-request', groupController.approveJoinRequest);

// Admin: Reject join request
router.post('/groups/:groupId/reject-request', groupController.rejectJoinRequest);

// Admin: Remove member from group
router.post('/groups/:groupId/remove-member', groupController.removeMember);

// Update group details (admin only)
router.put('/groups/:groupId', groupController.updateGroup);

// Delete a group (admin only)
router.delete('/groups/:groupId', groupController.deleteGroup);

module.exports = router;