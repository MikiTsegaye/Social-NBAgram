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

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already taken" });
        }

        // Hash password with bcryptjs
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, favoriteTeam });
        await newUser.save();

        const token = createToken(newUser);

        // Return user object in correct format
        res.status(201).json({ 
            message: "User registered successfully",
            token,
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

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Verify password with bcryptjs
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const token = createToken(user);

        // Return user object in correct format
        res.status(200).json({ 
            message: "Login successful",
            token,
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
