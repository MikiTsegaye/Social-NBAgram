const Group = require('../models/Group');

exports.createGroup = async (req, res) => {
    try {
        const newGroup = new Group(req.body);
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find().populate('admin', 'username');
        res.json(groups);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId).populate('admin', 'username');
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.json(group);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.searchGroups = async (req, res) => {
    try {
        const { name } = req.query;
        const results = await Group.find({ name: { $regex: name, $options: 'i' } });
        res.json(results);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getLockerRoomByName = async (req, res) => {
    try {
        const { teamName } = req.query;
        if (!teamName) {
            return res.status(400).json({ message: 'teamName is required' });
        }

        const group = await Group.findOne({
            name: { $regex: `^${teamName}$`, $options: 'i' }
        }).populate('admin', 'username');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(group);
    } catch (error) { res.status(500).json({ error: error.message }); }
};