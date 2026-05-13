const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Routes (Prefixing with /api is standard practice)
app.use('/api/auth', authRoutes);
app.use('/api', groupRoutes);
app.use('/api', postRoutes);

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

    socket.on('send_message', (data) => {
        io.emit('receive_message', data); 
    });

    socket.on('disconnect', () => console.log('Player left chat'));
});

// 5. Start Server (Define PORT first, then listen)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 NBA Backend Fully Operational on port ${PORT}`);
});