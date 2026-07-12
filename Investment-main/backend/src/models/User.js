const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    googleId: { type: String, index: true, unique: true, sparse: true },
    name: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    picture: { type: String },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
