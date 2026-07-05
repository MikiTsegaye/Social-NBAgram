const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const messageRoutes = require('./routes/messageRoutes');
const nbaTeams = require('./data/nbaTeams');

const Message = require('./models/Message');

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());

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
const activePlayers = new Map();

io.on('connection', (socket) => {
  console.log(`🏀 A player connected to the stadium: ${socket.id}`);

  // 👥 NEW: Handle registering user identity and tracking room state
  socket.on('join_team', ({ teamName, username }) => {
    if (!teamName || !username) return;
    
    const normalizedTeam = teamName.trim().toLowerCase();
    socket.join(normalizedTeam);
    
    // Save player's current location details
    activePlayers.set(socket.id, { username, team: normalizedTeam });

    // Broadcast the updated list of online users to everyone in this team room
    broadcastRoomRoster(normalizedTeam);
  });
  
  // Helper function to get all unique usernames in a specific room
  function broadcastRoomRoster(roomName) {
    const usersInRoom = [];
    activePlayers.forEach((value) => {
      if (value.team === roomName) {
        usersInRoom.push({ username: value.username });
      }
    });
    // Send to everyone in the locker room channel
    io.to(roomName).emit('room_users_update', usersInRoom);
  }

  // 💬 REAL-TIME COMMENT UPDATE BROADCASTER
  socket.on('send_post_comment_update', (updatedCommentPayload) => {
      socket.broadcast.emit('receive_post_comment_update', updatedCommentPayload);
  });

  // 📰 REAL-TIME POST STREAM BROADCASTER
  socket.on('send_post', (newPostData) => {
      console.log(`📣 New league post broadcasted by: @${newPostData?.author?.username || 'Player'}`);
      io.emit('receive_post', newPostData);
  });

  // 💬 SEND CHAT MESSAGE
  socket.on('send_message', async (data) => {
    // Note: To match what LockerRoomChat.jsx expects, we should emit to the team channel room
    const cleanTeam = data.team ? data.team.trim().toLowerCase() : null;
    const userRole = socket.userRole || data.role || 'watcher';
    const augmentedPayload = {
        ...data,
        captainTag: userRole === 'moderator' ? '[Captain] ' : ''
    };

    if (cleanTeam) {
        io.to(cleanTeam).emit('receive_message', augmentedPayload);
    } else {
        io.to(data.room).emit('receive_message', augmentedPayload);
    }

    if (!data || !data.sender || !data.text) return;

    try {
        if (data.team) {
            const cleanTeam = data.team.trim().toLowerCase();
            const newMsg = new Message({
                sender: data.senderId, 
                senderName: data.sender, 
                content: data.text, 
                team: cleanTeam
            });
            await newMsg.save();
            
            // Avoid duplicate emission if io.to(cleanTeam) already handles the payload live update
        } else if (data.receiverId) {
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

  // 🛑 Update disconnected user logs and broadcast the leaving event to room
  socket.on('disconnect', () => {
    const playerData = activePlayers.get(socket.id);
    if (playerData) {
        activePlayers.delete(socket.id);
        console.log(`🛑 Player @${playerData.username} left the stadium.`);
        // Refresh the roster for remaining users in that room
        broadcastRoomRoster(playerData.team);
    } else {
        console.log('🛑 An anonymous player left the stadium.');
    }
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 NBA Backend Fully Operational on port ${PORT}`);
});