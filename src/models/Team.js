const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
  }],
});

const Team = mongoose.model('Team', TeamSchema);

module.exports = Team;
