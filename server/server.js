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
const messageRoutes = require('./routes/messageRoutes');
const nbaTeams = require('./data/nbaTeams');

const User = require('./models/User');
const Group = require('./models/Group');
const Post = require('./models/Post');
const Message = require('./models/Message');

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());

// 🔍 Request Inspector Console Logger
app.use((req, res, next) => {
    console.log(`📡 Incoming Request: [${req.method}] to ${req.url}`);
    if (req.method === 'POST') console.log('📦 Request Body:', req.body);
    next();
});

// API route to fetch live database sync information for debugging and development purposes
app.get('/api/seed-info', async (req, res) => {
    try {
        const currentUsers = await User.find({}).select('-password');
        const currentGroups = await Group.find({});
        const currentPosts = await Post.find({}).populate('author', 'username');

        if (currentUsers.length === 0 && currentGroups.length === 0) {
            return res.status(200).json({
                message: 'Your database is currently empty. Please register or create groups via the app UI first!',
                users: [],
                groups: [],
                posts: []
            });
        }

        res.status(200).json({
            message: 'Live database records fetched successfully.',
            stats: {
                totalUsers: currentUsers.length,
                totalGroups: currentGroups.length,
                totalPosts: currentPosts.length
            },
            users: currentUsers.map((u) => ({ 
                _id: u._id, 
                username: u.username, 
                favoriteTeam: u.favoriteTeam, 
                role: u.role || 'watcher' 
            })),
            groups: currentGroups.map((g) => ({ 
                _id: g._id, 
                name: g.name,
                description: g.description,
                memberCount: Array.isArray(g.members) ? g.members.length : 0,
                pendingCount: Array.isArray(g.pendingRequests) ? g.pendingRequests.length : 0
            })),
            posts: currentPosts.map((p) => ({ 
                _id: p._id, 
                author: p.author?.username || 'Unknown Author', 
                content: p.content,
                teamTag: p.teamTag 
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch live database sync data.', error: error.message });
    }
});

// 🏀 NBA Teams API Endpoint
app.get('/api/nba-teams', (req, res) => {
    try {
        const { conference, division } = req.query;
        
        let filteredTeams = nbaTeams;
        
        // Filter by conference if specified
        if (conference) {
            filteredTeams = filteredTeams.filter(team => 
                team.conference.toLowerCase() === conference.toLowerCase()
            );
        }
        
        // Filter by division if specified
        if (division) {
            filteredTeams = filteredTeams.filter(team => 
                team.division.toLowerCase() === division.toLowerCase()
            );
        }
        
        res.status(200).json({
            message: 'NBA Teams retrieved successfully',
            total: filteredTeams.length,
            teams: filteredTeams
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching NBA teams', error: error.message });
    }
});



// 📁 Group Message History Routing Lookup
app.get('/api/messages/:teamName', async (req, res) => {
    try {
        const cleanTeamName = decodeURIComponent(req.params.teamName).trim().toLowerCase();
        const history = await Message.find({ team: cleanTeamName }).sort({ createdAt: 1 });
        
        const formattedHistory = history.map(msg => ({
            sender: msg.senderName || 'Anonymous', 
            text: msg.content,  
            team: msg.team
        }));
        
        res.json(formattedHistory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📁 1-on-1 Private Direct Message History Lookup Route
app.get('/api/messages/personal/:otherUserId', authMiddleware, async (req, res) => {
    try {
        const myId = req.user.id || req.user._id; // Extracted safely from token validation middleware context
        const otherId = req.params.otherUserId;

        // Pull messages where either player is sender or receiver matching the cross pair
        const history = await Message.find({
            team: 'private_dm',
            $or: [
                { sender: myId, receiver: otherId },
                { sender: otherId, receiver: myId }
            ]
        }).sort({ createdAt: 1 });

        // Map layout to output readable format standard for DirectMessages interface panels
        const formattedHistory = history.map(msg => ({
            senderId: msg.sender,
            senderName: msg.senderName || 'Anonymous',
            receiverId: msg.receiver,
            content: msg.content,
            timestamp: msg.createdAt
        }));

        res.json(formattedHistory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api', groupRoutes);
app.use('/api', postRoutes);
app.use('/api', messageRoutes);
app.use('/api', userRoutes);

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

// 📡 Real-time broadcast engine
io.on('connection', (socket) => {
  console.log(`🏀 A player connected to the stadium: ${socket.id}`);

  socket.on('join_team', (teamName) => {
    if (teamName) {
      const normalizedTeam = teamName.trim().toLowerCase();
      socket.join(normalizedTeam);
      console.log(`🚪 Player unified on channel room: ${normalizedTeam}`);
    }
  }); // 👈 Decoupled cleanly here!

  socket.on('join_room', (teamName) => {
    if (teamName) {
      const normalizedTeam = teamName.trim().toLowerCase();
      socket.join(normalizedTeam);
      console.log(`🚪 Player unified on channel room: ${normalizedTeam}`);
    }
  });
  
  // 💬 REAL-TIME COMMENT UPDATE BROADCASTER
  socket.on('send_post_comment_update', (updatedCommentPayload) => {
      socket.broadcast.emit('receive_post_comment_update', updatedCommentPayload);
  });

  // 📰 REAL-TIME POST STREAM BROADCASTER (Sits independently in the stadium connection)
  socket.on('send_post', (newPostData) => {
      console.log(`📣 New league post broadcasted by: @${newPostData?.author?.username || 'Player'}`);
      // Broadcast out to all connected clients instantly
      io.emit('receive_post', newPostData);
  });

  // 💬 SEND CHAT MESSAGE (Handles both Group Channels and Private DMs)
  socket.on('send_message', async (data) => {
    const userRole = socket.userRole || data.role || 'watcher';
    const augmentedPayload = {
        ...data,
        // If they are a moderator, add the visual tag prefix
        captainTag: userRole === 'moderator' ? '[Captain] ' : ''
    };
    io.to(data.room).emit('receive_message', augmentedPayload);

    if (!data || !data.sender || !data.text) {
        return;
    }

    try {
        if (data.team) {
            // 🏀 Room Locker Chat Controller
            const cleanTeam = data.team.trim().toLowerCase();
            const newMsg = new Message({
                sender: data.senderId, 
                senderName: data.sender, 
                content: data.text, 
                team: cleanTeam
            });
            await newMsg.save();

            io.emit('receive_message', {
                senderId: data.senderId,
                sender: data.sender, 
                text: data.text,
                team: cleanTeam,
                timestamp: newMsg.createdAt
            });
        } else if (data.receiverId) {
            // 🔒 Private 1-on-1 DM Controller
            const newDM = new Message({
                sender: data.senderId,
                senderName: data.sender,
                receiver: data.receiverId,
                content: data.text,
                team: 'private_dm' 
            });
            await newDM.save();

            io.emit('receive_message', {
                senderId: data.senderId,
                sender: data.sender,
                receiverId: data.receiverId,
                text: data.text,
                timestamp: newDM.createdAt
            });
        }
    } catch (error) {
        console.error("❌ Socket message processing failure:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('🛑 A player left the stadium.');
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 NBA Backend Fully Operational on port ${PORT}`);
});