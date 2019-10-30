/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/User');
const Team = require('../models/Team');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.post('/create', verifyToken, async (req, res, next) => {
  try {
    const {
      name, description,
    } = req.body;

    const { userId } = req.data;

    const team = await Team.create({
      name,
      description,
      owner: userId,
    });

    team.members.push(new mongoose.Types.ObjectId(userId));

    await team.save();

    const user = await User.findById(userId);

    user.teams.push(new mongoose.Types.ObjectId(team._id));

    user.save();

    return res.status(200).json({
      message: 'Team created successfully',
      team,
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
});

router.get('/get-teams', verifyToken, async (req, res) => {
  try {
    const { userId } = req.data;

    const teams = await Team.find({ owner: userId }).populate('posts');

    return res.status(200).json({ teams });
  } catch (error) {
    return res.status(404).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
