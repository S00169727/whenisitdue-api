/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/User');
const Team = require('../models/Team');
const Post = require('../models/Team');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.post('/create', verifyToken, async (req, res, next) => {
  try {
    const {
      title, body, teamId,
    } = req.body;

    const { userId } = req.data;

    const post = await Post.create({
      title,
      body,
      team: teamId,
      owner: userId,
    });

    const user = await User.findById(userId);

    user.posts.push(new mongoose.Types.ObjectId(post._id));

    await user.save();

    const team = await Team.findById(teamId);

    team.posts.push(new mongoose.Types.ObjectId(post._id));

    await team.save();

    return res.status(200).json({
      message: 'Team created successfully',
      post,
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
});

module.exports = router;
