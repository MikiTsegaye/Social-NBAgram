const Group = require('../models/Group');

exports.createGroup = async (req, res) => {
    try {
        const newGroup = new Group(req.body);
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find().populate('admin', 'username');
        res.json(groups);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

// Get group details by ID
exports.getGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId).populate('admin', 'username');
        if (!group) {
            return res.status(404).json({ message: 'Group not found' }); }
        res.json(group);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

// Requirement: Search
exports.searchGroups = async (req, res) => {
    try {
        const { name } = req.query;
        const results = await Group.find({ name: { $regex: name, $options: 'i' } });
        res.json(results);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

// Requirement: Update & Delete with access control
exports.updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId, userRole } = req.body; // Authorization check

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check authorization: only admin or group admin can update
        const isGroupAdmin = group.admin.toString() === userId;
        const isSystemAdmin = userRole === 'admin';

        if (!isGroupAdmin && !isSystemAdmin) {
            return res.status(403).json({ message: "Unauthorized - Only group admin can update this group" });
        }

        // Extract allowed update fields
        const { name, description } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;

        const updated = await Group.findByIdAndUpdate(groupId, updateData, { new: true });
        res.json({ message: "Group updated successfully", group: updated });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId, userRole } = req.body; // Authorization check

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check authorization: only admin or group admin can delete
        const isGroupAdmin = group.admin.toString() === userId;
        const isSystemAdmin = userRole === 'admin';

        if (!isGroupAdmin && !isSystemAdmin) {
            return res.status(403).json({ message: "Unauthorized - Only group admin can delete this group" });
        }

        await Group.findByIdAndDelete(groupId);
        res.json({ message: "Group deleted successfully" });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
};

// Request to join group (users can request membership)
exports.requestToJoinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if user is already a member
        if (group.members.includes(userId)) {
            return res.status(400).json({ message: "User is already a member of this group" });
        }

        // Check if request already exists
        if (group.pendingRequests.includes(userId)) {
            return res.status(400).json({ message: "Request already pending" });
        }

        // Add to pending requests
        group.pendingRequests.push(userId);
        await group.save();

        res.status(201).json({ message: "Join request sent successfully", group });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
};

// Admin: Approve join request
exports.approveJoinRequest = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId, requestUserId, adminId, adminRole } = req.body;

        // Check authorization: only group admin or system admin can approve
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isGroupAdmin = group.admin.toString() === adminId;
        const isSystemAdmin = adminRole === 'admin';

        if (!isGroupAdmin && !isSystemAdmin) {
            return res.status(403).json({ message: "Unauthorized - Only group admin can approve requests" });
        }

        // Check if request exists
        if (!group.pendingRequests.includes(requestUserId)) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Remove from pending and add to members
        group.pendingRequests = group.pendingRequests.filter(id => id.toString() !== requestUserId);
        group.members.push(requestUserId);
        await group.save();

        res.json({ message: "Request approved - User added to group", group });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
};

// Admin: Reject/Cancel join request
exports.rejectJoinRequest = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { requestUserId, adminId, adminRole } = req.body;

        // Check authorization
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isGroupAdmin = group.admin.toString() === adminId;
        const isSystemAdmin = adminRole === 'admin';

        if (!isGroupAdmin && !isSystemAdmin) {
            return res.status(403).json({ message: "Unauthorized - Only group admin can reject requests" });
        }

        // Check if request exists
        if (!group.pendingRequests.includes(requestUserId)) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Remove from pending
        group.pendingRequests = group.pendingRequests.filter(id => id.toString() !== requestUserId);
        await group.save();

        res.json({ message: "Request rejected", group });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
};

// Get pending requests for a group (admin only)
exports.getPendingRequests = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { adminId, adminRole } = req.body;

        // Check authorization
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isGroupAdmin = group.admin.toString() === adminId;
        const isSystemAdmin = adminRole === 'admin';

        if (!isGroupAdmin && !isSystemAdmin) {
            return res.status(403).json({ message: "Unauthorized - Only group admin can view pending requests" });
        }

        const pendingUsers = await Group.findById(groupId)
            .populate('pendingRequests', 'username team');

        res.json({ 
            message: "Pending requests retrieved", 
            pendingRequests: pendingUsers.pendingRequests 
        });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
};

// Admin: Remove member from group
exports.removeMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { memberUserId, adminId, adminRole } = req.body;

        // Check authorization
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isGroupAdmin = group.admin.toString() === adminId;
        const isSystemAdmin = adminRole === 'admin';

        if (!isGroupAdmin && !isSystemAdmin) {
            return res.status(403).json({ message: "Unauthorized - Only group admin can remove members" });
        }

        // Check if member exists
        if (!group.members.includes(memberUserId)) {
            return res.status(404).json({ message: "Member not found in group" });
        }

        // Remove member
        group.members = group.members.filter(id => id.toString() !== memberUserId);
        await group.save();

        res.json({ message: "Member removed from group", group });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
};