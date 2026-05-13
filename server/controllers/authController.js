const User = require('../models/User');
// Register User

exports.register = async (req, res) => {
    try {
        const { username, password, team } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already taken" });
        }

        // Create new user
        const newUser = new User({ username, password, team });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
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

        res.status(200).json({ message: "Login successful", user:
            {
                id: user._id,
                username: user.username,
                team: user.team,
                role: user.role,
            }
         });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};
