/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/User');
const Team = require('../models/Team');
const Post = require('../models/Post');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.post('/create', verifyToken, async (req, res) => {
  try {
    const {
      title, body, teamId, dueDate,
    } = req.body;

    const { userId } = req.data;

    const post = await Post.create({
      title,
      body,
      team: teamId,
      owner: userId,
      dueDate: new Date(dueDate),
    });

    await post.save();

    const user = await User.findById(userId);

    user.posts.push(new mongoose.Types.ObjectId(post._id));

    await user.save();

    const team = await Team.findById(teamId);

    team.posts.push(new mongoose.Types.ObjectId(post._id));

    await team.save();

    return res.status(200).json({
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
});

router.post('/get-posts-by-team', verifyToken, async (req, res) => {
  try {
    const { teamId } = req.body;

    const posts = await Post.find({ team: teamId }).populate('owner', 'name').populate('members');

    const team = await Team.findById(teamId).populate('members owner', 'name').select('name description createdAt');

    return res.status(200).json({ posts, team });
  } catch (error) {
    return res.status(404).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
