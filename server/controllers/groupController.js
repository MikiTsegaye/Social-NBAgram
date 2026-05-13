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

// Requirement: Search
exports.searchGroups = async (req, res) => {
    try {
        const { name } = req.query;
        const results = await Group.find({ name: { $regex: name, $options: 'i' } });
        res.json(results);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

// Requirement: Update & Delete
exports.updateGroup = async (req, res) => {
    const updated = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
};

exports.deleteGroup = async (req, res) => {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: "Group deleted" });
};