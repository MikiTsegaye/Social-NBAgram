const Group = require('../models/Group');
const User = require('../models/User');
const mongoose = require('mongoose');

// 1. Submit Join Request (For Watchers)
exports.requestToJoinGroup = async (req, res) => {
    try {
        const { groupName } = req.body;
        const userId = req.user.id;
        const username = req.user.username;

        const group = await Group.findOne({ name: groupName });
        if (!group) return res.status(404).json({ message: "Locker room not found." });

        // Check if user is already listed in the queue
        const alreadyRequested = group.pendingRequests.some(r => r.userId.toString() === userId);
        if (alreadyRequested) return res.status(400).json({ message: "Application already pending." });

        group.pendingRequests.push({ userId, username });
        await group.save();

        res.json({ message: "Application submitted to Team Captain successfully." });
    } catch (err) {
        res.status(500).json({ message: "Error submitting request", error: err.message });
    }
};

// 2. Fetch Pending Inbox Requests (For Captains)
exports.getCaptainInbox = async (req, res) => {
    try {
        // Find the group managed by this specific captain
        const group = await Group.findOne({ captain: req.user.id });
        if (!group) return res.json({ pendingRequests: [] }); // User isn't a captain of any room

        res.json({ teamName: group.name, requests: group.pendingRequests });
    } catch (err) {
        res.status(500).json({ message: "Error fetching inbox.", error: err.message });
    }
};

// 3. Process Request (Approve or Deny)
exports.processJoinRequest = async (req, res) => {
    try {
        const { userId, action } = req.body; // action: 'approve' or 'deny'
        const captainId = req.user.id;

        const group = await Group.findOne({ captain: captainId });
        if (!group) return res.status(403).json({ message: "Unauthorized - You are not a captain." });

        // Pull user from pending list
        group.pendingRequests = group.pendingRequests.filter(r => r.userId.toString() !== userId);
        await group.save();

        if (action === 'approve') {
            // Upgrade user to Full Member and unlock their access
            await User.findByIdAndUpdate(userId, {
                role: 'member',
                approvedTeam: group.name
            });
        }

        res.json({ message: `Player successfully ${action}ed.`, requests: group.pendingRequests });
    } catch (err) {
        res.status(500).json({ message: "Error processing request.", error: err.message });
    }
};

exports.createGroup = async (req, res) => {
    try {
        const newGroup = new Group(req.body);
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('admin', 'username')
            .populate('members', 'username favoriteTeam profilePicture'); // 👈 Add this line!
        res.json(groups);
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
};
// Get Locker Room Data by Team Name string match
exports.getLockerRoomByName = async (req, res) => {
    try {
        const teamName = req.query.teamName;
        if (!teamName) return res.status(400).json({ message: "Team name parameter is required." });

        // Extract the last word (e.g., "Los Angeles Lakers" -> "Lakers")
        const nameWords = teamName.trim().split(' ');
        const coreWord = nameWords[nameWords.length - 1]; 

        // 1. Fetch group profile and populate member sub-documents
        let group = await Group.findOne({ name: { $regex: coreWord, $options: 'i' } })
            .populate({
                path: 'members',
                model: 'User',
                select: 'username favoriteTeam'
            });

        // Dynamic presentation fallback generation if room doc doesn't exist yet
        let groupObj;
        if (!group) {
            groupObj = {
                name: teamName,
                description: `Official ${teamName} player hangout room.`,
                members: []
            };
        } else {
            groupObj = group.toObject();
        }

        if (!groupObj.members) groupObj.members = [];

        // 2. 👥 STRICT TEAM ROSTER ENHANCER
        const currentUserId = req.user?.id || req.user?._id || null;
        
        // Build query condition: Must match THIS specific team name text
        let queryCondition = { 
            favoriteTeam: { $regex: coreWord, $options: 'i' } 
        };
        
        // Exclude the currently logged-in user from being cloned in the query
        if (currentUserId) {
            queryCondition._id = { $ne: currentUserId };
        }

        // Fetch up to 5 actual users registered on your system who share THIS favorite team
        const otherTeamPlayers = await User.find(queryCondition).limit(5).select('username favoriteTeam');

        // Merge them cleanly into the display payload array
        const existingMemberNames = new Set(groupObj.members.map(m => String(m.username || m).toLowerCase()));
        
        if (otherTeamPlayers && otherTeamPlayers.length > 0) {
            otherTeamPlayers.forEach(player => {
                if (!existingMemberNames.has(String(player.username).toLowerCase())) {
                    groupObj.members.push(player);
                }
            });
        }

        res.json(groupObj);
    } catch (error) {
        console.error("❌ Roster Injection Error:", error.message);
        res.status(500).json({ message: "Error loading team roster data.", error: error.message });
    }
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


