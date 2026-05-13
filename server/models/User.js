const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    team: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user'},
    isVerified: { type: Boolean, default: false },
    profilePicture: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);