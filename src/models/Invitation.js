const mongoose = require('mongoose');

const InvitationSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  inviteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  expired: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Invitation = mongoose.model('Invitation', InvitationSchema);

module.exports = Invitation;
