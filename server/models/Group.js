const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., "Lakers"
    description: { type: String },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The Team Manager
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);