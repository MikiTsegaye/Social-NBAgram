const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Create a new group
router.post('/groups', groupController.createGroup);

//Get all groups
router.get('/groups', groupController.getAllGroups);

// Search groups by name
router.get('/groups/search', groupController.searchGroups);

// Update group details
router.put('/groups/:id', groupController.updateGroup);

//Delete a group
router.delete('/groups/:id', groupController.deleteGroup);

module.exports = router;