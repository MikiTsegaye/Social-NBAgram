const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favoriteTeam: { type: String, required: true }, // Team preference
    isAdmin: { type: Boolean, default: false }, // Admin/Group Manager flag
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }], // Groups user is member of
    profilePicture: { type: String, default: '' },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);