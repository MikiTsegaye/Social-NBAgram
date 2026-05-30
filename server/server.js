const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const User = require('./models/User');
const Group = require('./models/Group');
const Post = require('./models/Post');

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Seed endpoint
app.post('/api/seed', async (req, res) => {
    try {
        await Promise.all([
            User.deleteMany({}),
            Group.deleteMany({}),
            Post.deleteMany({})
        ]);

        const users = [
            {
                _id: new mongoose.Types.ObjectId(),
                username: 'kingjames',
                password: await bcrypt.hash('password123', 10),
                favoriteTeam: 'Lakers',
                isAdmin: true,
                isVerified: true,
                profilePicture: 'https://example.com/lebron.png'
            },
            {
                _id: new mongoose.Types.ObjectId(),
                username: 'durantula',
                password: await bcrypt.hash('playerpass', 10),
                favoriteTeam: 'Nets',
                isAdmin: false,
                isVerified: true
            },
            {
                _id: new mongoose.Types.ObjectId(),
                username: 'stephcurry',
                password: await bcrypt.hash('courtking', 10),
                favoriteTeam: 'Warriors',
                isAdmin: false,
                isVerified: true
            },
            {
                _id: new mongoose.Types.ObjectId(),
                username: 'tatumfan',
                password: await bcrypt.hash('greenlight', 10),
                favoriteTeam: 'Lakers',
                isAdmin: false,
                isVerified: false
            }
        ];

        await User.insertMany(users);

        const groups = [
            {
                _id: new mongoose.Types.ObjectId(),
                name: 'Lakers Locker Room',
                description: 'Official Lakers player hangout.',
                admin: users[0]._id,
                members: [users[0]._id, users[3]._id]
            },
            {
                _id: new mongoose.Types.ObjectId(),
                name: 'Nets Playbook',
                description: 'Brooklyn offensive and defensive strategy.',
                admin: users[1]._id,
                members: [users[1]._id]
            },
            {
                _id: new mongoose.Types.ObjectId(),
                name: 'Warriors Strength Room',
                description: 'Golden State workout and court talk.',
                admin: users[2]._id,
                members: [users[2]._id]
            }
        ];

        await Group.insertMany(groups);

        const posts = [
            {
                _id: new mongoose.Types.ObjectId(),
                author: users[0]._id,
                content: 'Lakers are locked in for playoff mode. Let\'s keep stacking W\'s.',
                mediaUrl: '',
                teamTag: 'Lakers'
            },
            {
                _id: new mongoose.Types.ObjectId(),
                author: users[2]._id,
                content: 'Splash practice is on point today. Curry range is untouchable.',
                mediaUrl: '',
                teamTag: 'Warriors'
            },
            {
                _id: new mongoose.Types.ObjectId(),
                author: users[1]._id,
                content: 'Nets meeting at 7pm. Bring the energy and the plays.',
                mediaUrl: '',
                teamTag: 'Nets'
            }
        ];

        await Post.insertMany(posts);

        res.status(201).json({
            message: 'Seed data created',
            users: users.map((u) => ({ _id: u._id, username: u.username, favoriteTeam: u.favoriteTeam, isAdmin: u.isAdmin })),
            groups: groups.map((g) => ({ _id: g._id, name: g.name })),
            posts: posts.map((p) => ({ _id: p._id, author: p.author, teamTag: p.teamTag }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Seed failed', error: error.message });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api', authMiddleware, groupRoutes);
app.use('/api', authMiddleware, postRoutes);

// 3. Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ NBA Cloud Database Connected"))
    .catch(err => console.log("❌ Connection Error:", err));

app.get('/', (req, res) => {
    res.send("NBA Server is running!");
});

// 4. Server & Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

io.on('connection', (socket) => {
    console.log('A player entered the Locker Room Chat:', socket.id);

    socket.on('join_team', (teamName) => {
        if (!teamName || typeof teamName !== 'string') {
            return;
        }
        socket.join(teamName);
        console.log(`Socket ${socket.id} joined team room: ${teamName}`);
    });

    socket.on('send_message', (data) => {
        if (!data || !data.sender || !data.text || !data.team) {
            return;
        }

        const messagePayload = {
            sender: data.sender,
            text: data.text,
            team: data.team,
            timestamp: new Date().toISOString()
        };

        io.to(data.team).emit('receive_message', messagePayload);
    });

    socket.on('disconnect', () => console.log('Player left chat: ' + socket.id));
});

app.use(errorHandler);

// 5. Start Server (Define PORT first, then listen)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 NBA Backend Fully Operational on port ${PORT}`);
});