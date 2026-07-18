const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    googleId: { type: String, index: true, unique: true, sparse: true },
    name: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    password: { type: String },
    picture: { type: String },
    lastLoginAt: { type: Date },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
