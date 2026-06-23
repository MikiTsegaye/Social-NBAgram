const Message = require('../models/Message');

// 🏀 Action 1: Fetch all messages from a team's group chat locker room
exports.getGroupMessages = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    
    const messages = await Message.find({ group: groupId })
      .populate('sender', '_id username favoriteTeam') // Attach sender details nicely!
      .sort({ createdAt: 1 }); // Sort from oldest to newest so it reads like a real chat feed
      
    res.status(200).json(messages);
  } catch (error) {
    next(error); // Pass it to error shield!
  }
};

// 🔒 Action 2: Fetch all private DMs between two specific users
exports.getPersonalMessages = async (req, res, next) => {
  try {
    const myId = req.user.id; // Grabbed straight from your auth guard token!
    const { otherUserId } = req.params;
    
    // Find messages where (I sent it to them) OR (They sent it to me)
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId }
      ]
    })
    .populate('sender', '_id username favoriteTeam')
    .sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

// 📝 Action 3: Save a message manually (Fallback if WebSockets sync needs rest)
exports.sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { content, receiverId, groupId } = req.body;
    
    const newMessage = new Message({
      sender: senderId,
      content,
      receiver: receiverId || undefined,
      group: groupId || undefined
    });
    
    await newMessage.save();
    
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', '_id username favoriteTeam');
      
    res.status(201).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};