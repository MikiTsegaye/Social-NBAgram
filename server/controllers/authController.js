const User = require('../models/User');

// Register User
exports.register = async (req, res) => {
    try {
        const { username, password, favoriteTeam } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already taken" });
        }

        // Create new user
        const newUser = new User({ username, password, favoriteTeam });
        await newUser.save();

        // Return user object in correct format
        res.status(201).json({ 
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                username: newUser.username,
                favoriteTeam: newUser.favoriteTeam,
                isAdmin: newUser.isAdmin,
                groups: newUser.groups,
                createdAt: newUser.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Return user object in correct format
        res.status(200).json({ 
            message: "Login successful",
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
        res.status(500).json({ message: "Error logging in", error });
    }
};
