const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment')
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.post('/create', verifyToken, async (req,res) => {
  try {
    const {
      postId, message
    } = req.body;

    const { userId } = req.data;

    const comment = await Comment.create({
      message,
      post: new mongoose.Types.ObjectId(postId),
      owner: new mongoose.Types.ObjectId(userId)
    })
    console.log(comment.post)

    await comment.save();

    const user = await User.findById(userId);

    user.comments.push(new mongoose.Types.ObjectId(comment._id));

    await user.save();

    const post = await Post.findById(postId);

    post.comments.push(new mongoose.Types.ObjectId(comment._id));

    await post.save();

    return res.status(200).json({
      message: 'Comment created successfully',
      comment,
    })
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
});

router.post('/get-comments-by-post', verifyToken, async (req, res) => {
  try{
    const { postId } = req.body;
    const { userId } = req.data;

    const comments = await Comment.find({ post: postId });

    return res.status(200).json({
      comments, userId
    })
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
})

router.post('/get-comments-by-user', verifyToken, async (req, res) => {
  try{
    const { userId } = req.data;

    const comments = await Comment.find({ owner: userId });

    return res.status(200).json({
      comments, userId
    })
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
})

module.exports = router;