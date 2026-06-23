const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    
  // 🏀 Who sent the message?
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  senderName: {
    type: String,
    required: true
  },
  
  // 🔒 For Personal Messages: Who is receiving it? (Optional if it's a team group chat)
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // 🏆 For Team Group Chats: Which team room does this message belong to? (Optional if it's a private DM)
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group' 
  },
  
  // 💬 The actual text text string!
  content: { 
    type: String, 
    required: true 
  },
  
  // 👀 Has the recipient opened it yet?
  isRead: { 
    type: Boolean, 
    default: false 
  },
  team: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true }); // Automatically gives us a createdAt timestamp!

module.exports = mongoose.model('Message', messageSchema);