const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // can be null for group chats, but here it's 1-on-1 mostly
  },
  message: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image'],
    default: 'text'
  },
  reactions: {
    type: Map,
    of: String // userId -> emoji
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
