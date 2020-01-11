/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/User');
const Team = require('../models/Team');
const Invitation = require('../models/Invitation');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.post('/create', verifyToken, async (req, res) => {
  try {
    const { email, teamId } = req.body.data;
    const { userId: senderId } = req.data;

    const invitee = await User.findOne({ email });

    if (!invitee || invitee._id.equals(senderId)) {
      return res.status(400).json({
        message: 'You cant invite yourself',
      });
    }

    const invite = await Invitation.create({
      senderId,
      inviteeId: invitee._id,
      teamId,
    });

    await invite.save();

    return res.status(200).json({
      message: 'Invite sent!',
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
});

router.get('/get-invites', verifyToken, async (req, res) => {
  try {
    const invites = await Invitation.find({ inviteeId: req.data.userId })
      .populate('senderId', 'name')
      .populate('teamId', 'name description createdAt');

    return res.status(200).json({ invites });
  } catch (error) {
    return res.status(404).json({ message: 'Something went wrong' });
  }
});

router.delete('/remove/:id', verifyToken, async (req, res) => {
  try {
    const { id: invitationId } = req.params;
    const { userId } = req.data;

    const invite = await Invitation.findById(invitationId);

    if (!invite || !invite.inviteeId.equals(userId)) {
      return res.status(404).json({ message: 'Something went wrong' });
    }

    await invite.remove();

    return res.status(200).json({ message: 'Invite deleted!' });
  } catch (error) {
    return res.status(404).json({ message: 'Something went wrong' });
  }
});

router.post('/accept', verifyToken, async (req, res) => {
  try {
    const { teamId, inviteId } = req.body.data;
    const { userId } = req.data;

    const user = await User.findById(userId);
    const team = await Team.findById(teamId);

    if (
      !user
      || !team
      || user.teams.includes(new mongoose.Types.ObjectId(teamId))
    ) {
      return res.status(404).json({ message: 'Something went wrong' });
    }

    user.teams.push(new mongoose.Types.ObjectId(teamId));
    team.members.push(new mongoose.Types.ObjectId(userId));

    await Invitation.deleteOne({ _id: inviteId });

    await user.save();
    await team.save();

    return res.status(200).json({ message: 'Invite accepted!' });
  } catch (error) {
    return res.status(404).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
