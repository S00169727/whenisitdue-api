/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/User');
const Team = require('../models/Team');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.post('/create', verifyToken, async (req, res) => {
  try {
    const {
      title, body, teamId, dueDate, time,
    } = req.body;

    const { userId } = req.data;

    const post = await Post.create({
      title,
      body,
      team: teamId,
      owner: userId,
      dueDate: new Date(dueDate.year, dueDate.month - 1, dueDate.day, time.hour, time.minute, time.second),
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
    const { userId } = req.data;

    const team = await Team.findById(teamId).populate('members owner', 'name').select('name description createdAt admins');

    if (!team.members.filter(el => el._id.equals(req.data.userId)).length > 0) {
      const limitedTeam = await Team.findById(teamId).select('name description createdAt');
      return res.status(200).json({ limitedTeam, isMember: false });
    }

    const posts = await Post.find({ team: teamId }).populate('owner', 'name').populate('members');

    const user = await User.findById(userId);

    const isFavourited = user.favourites.filter(el => el._id.equals(teamId)).length > 0;

    return res.status(200).json({
      posts, team, userId, isMember: true, isFavourited,
    });
  } catch (error) {
    return res.status(404).json({ message: 'Something went wrong' });
  }
});

router.get('/get-posts-by-user', verifyToken, async (req, res) => {
  try {
    const { userId } = req.data;

    const posts = await Post.find({ owner: userId }).populate('posts').populate('team', 'name');

    return res.status(200).json({ posts, userId });
  } catch (error) {
    return res.status(404).json({ message: 'Something went wrong' });
  }
});

router.post('/remove', verifyToken, async (req, res) => {
  try {
    const { postId } = req.body;
    const { userId } = req.data;

    const post = await Post.findById(postId);

    const team = await Team.findOne({ _id: new mongoose.Types.ObjectId(post.team) });

    if (!team.admins.filter(el => el.equals(new mongoose.Types.ObjectId(userId))).length > 0 && !post.owner.equals(userId)) {
      return res.status(404).json({ message: 'Something went wrong' });
    }

    await Comment.deleteMany({ post: new mongoose.Types.ObjectId(postId) });

    await post.remove();

    await Team.findOneAndUpdate(
      { _id: post.team },
      { $pull: { posts: new mongoose.Types.ObjectId(post._id) } },
    );

    await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { posts: new mongoose.Types.ObjectId(post._id) } },
    );

    return res.status(200).json({ message: 'Post removed!' });
  } catch (error) {
    return res.status(404).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
