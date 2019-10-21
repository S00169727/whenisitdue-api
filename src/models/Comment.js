const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
