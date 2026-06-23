const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            username: user.username,
            isAdmin: user.isAdmin,
        },
        process.env.JWT_SECRET || 'nba_secret_default',
        { expiresIn: '7d' }
    );
};

// Register User
exports.register = async (req, res) => {
    try {
        const { username, password, favoriteTeam } = req.body;

        if (!username || !password || !favoriteTeam) {
            return res.status(400).json({ message: 'Username, password, and favoriteTeam are required' });
        }

        // 🏀 Case-Insensitive Check: Prevent duplicating usernames with different casing
        const existingUser = await User.findOne({ 
            username: { $regex: new RegExp(`^${username.trim()}$`, 'i') } 
        });
        
        if (existingUser) {
            return res.status(400).json({ message: "Username already taken" });
        }

        // Hash secret credentials safely
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ 
            username: username.trim(), // Saves original casing choice for UI display
            password: hashedPassword, 
            favoriteTeam: favoriteTeam.trim(),
            isAdmin: false,
            isVerified: false,
            profilePicture: 'https://example.com/default-player.png',
            groups: []
        });
        
        await newUser.save();
        const token = createToken(newUser);

        res.status(201).json({ 
            message: "User registered successfully",
            token,
            user: {
                _id: newUser._id,
                username: newUser.username,
                favoriteTeam: newUser.favoriteTeam,
                isAdmin: newUser.isAdmin,
                groups: newUser.groups || [],
                createdAt: newUser.createdAt
            }
        });
    } catch (error) {
        console.error("❌ Mongoose Registration Save Error:", error);
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // 🏀 Case-Insensitive Lookup: Matches "lebron", "LeBron", or "LEBRON" instantly
        const user = await User.findOne({ 
            username: { $regex: new RegExp(`^${username.trim()}$`, 'i') } 
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const token = createToken(user);

        res.status(200).json({ 
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                username: user.username,
                favoriteTeam: user.favoriteTeam,
                isAdmin: user.isAdmin,
                groups: user.groups || [],
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};