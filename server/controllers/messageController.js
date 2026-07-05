const Message = require('../models/Message');

exports.getTeamMessages = async (req, res, next) => {
  try {
    const teamName = decodeURIComponent(req.params.teamName || '').trim().toLowerCase();
    if (!teamName) {
      return res.status(400).json({ error: 'teamName is required' });
    }

    const messages = await Message.find({ team: teamName })
      .sort({ createdAt: 1 });

    const formattedMessages = messages.map((msg) => ({
      sender: msg.senderName || 'Anonymous',
      text: msg.content,
      team: msg.team,
      timestamp: msg.createdAt
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    next(error);
  }
};

exports.getPersonalMessages = async (req, res, next) => {
  try {
    const myId = req.user.id || req.user._id;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      team: 'private_dm',
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId }
      ]
    })
      .sort({ createdAt: 1 });

    const formattedMessages = messages.map((msg) => ({
      senderId: msg.sender,
      senderName: msg.senderName || 'Anonymous',
      receiverId: msg.receiver,
      content: msg.content,
      timestamp: msg.createdAt
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const senderName = req.user.username || req.user.name || 'Anonymous';
    const { content, receiverId, groupId, team } = req.body;

    const newMessage = new Message({
      sender: senderId,
      senderName,
      content,
      receiver: receiverId || undefined,
      group: groupId || undefined,
      team: team || (groupId ? 'group_chat' : 'private_dm')
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', '_id username favoriteTeam');

    res.status(201).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};