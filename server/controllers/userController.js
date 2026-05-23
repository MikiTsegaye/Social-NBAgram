const User = require('../models/User');

// Get user by ID (Read)
exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId)
            .select('-password')
            .populate('groups', 'name');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({ 
            message: "User found", 
            user: {
                _id: user._id,
                username: user.username,
                favoriteTeam: user.favoriteTeam,
                isAdmin: user.isAdmin,
                groups: user.groups,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error });
    }
};

// Get all users (Read)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('groups', 'name')
            .sort({ createdAt: -1 });
        
        const formattedUsers = users.map(user => ({
            _id: user._id,
            username: user.username,
            favoriteTeam: user.favoriteTeam,
            isAdmin: user.isAdmin,
            groups: user.groups,
            createdAt: user.createdAt
        }));
        
        res.status(200).json({ 
            message: "Users retrieved successfully", 
            users: formattedUsers 
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
};

// Update user (Update)
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, favoriteTeam, isAdmin, profilePicture } = req.body;

        // Check if username is already taken by another user
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: "Username already taken" });
            }
        }

        const updateData = {};
        if (username) updateData.username = username;
        if (favoriteTeam) updateData.favoriteTeam = favoriteTeam;
        if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
        if (profilePicture) updateData.profilePicture = profilePicture;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        )
            .select('-password')
            .populate('groups', 'name');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ 
            message: "User updated successfully", 
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                favoriteTeam: updatedUser.favoriteTeam,
                isAdmin: updatedUser.isAdmin,
                groups: updatedUser.groups,
                createdAt: updatedUser.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error });
    }
};

// Delete user (Delete)
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error });
    }
};

// Search users by username and/or team
exports.searchUsers = async (req, res) => {
    try {
        const { query, favoriteTeam } = req.query;
        let filter = {};

        // Build dynamic filter based on query parameters
        if (query) {
            filter.username = { $regex: query, $options: 'i' }; // Case-insensitive search
        }

        if (favoriteTeam) {
            filter.favoriteTeam = favoriteTeam;
        }

        const results = await User.find(filter)
            .select('-password')
            .populate('groups', 'name')
            .sort({ createdAt: -1 });

        const formattedResults = results.map(user => ({
            _id: user._id,
            username: user.username,
            favoriteTeam: user.favoriteTeam,
            isAdmin: user.isAdmin,
            groups: user.groups,
            createdAt: user.createdAt
        }));

        res.status(200).json({
            message: "User search completed",
            count: formattedResults.length,
            results: formattedResults
        });
    } catch (error) {
        res.status(500).json({ message: "Error searching users", error });
    }
};
