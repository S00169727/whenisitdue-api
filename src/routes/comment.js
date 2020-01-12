const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/User');
const Post = require('../models/Post');
const Team = require('../models/Team');
const Comment = require('../models/Comment');
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

    const comments = await Comment.find({ post: postId }).populate('owner', 'name');

    const post = await Post.findById(postId)

    return res.status(200).json({
      comments, userId, post
    })
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
})

router.post('/get-post-and-comments', verifyToken, async (req, res) => {
  try{
    const { postId } = req.body;
    const { userId } = req.data;

    const comments = await Post.find({ post: postId }).populate('comments');

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

    const post = await Comment.find({ owner: userId });

    return res.status(200).json({
      post, userId
    })
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
})

router.post('/edit', verifyToken, async (req, res) => {
  try {
    const {
      commentId,
      updatedMessage
    } = req.body;

    const { userId } = req.data;

    const comment = await Comment.findById(commentId).populate('post');
  
    const team = await Team.findById({ _id: new mongoose.Types.ObjectId(comment.post.team) });

    if (!team.admins.filter(el => el.equals(new mongoose.Types.ObjectId(userId))).length > 0 
        && !comment.owner.equals(userId) 
        || !team.owner.equals(userId)) {
      return res.status(404).json({ message: 'Something went wrong' });
    }

    await comment.update( 
      { $set: {message: updatedMessage} }
    )

    return res.status(200).json({ message: 'Comment Updated' });

  } catch (error) {
    return res.status(500).json({
      error
    })
  }
})


router.post('/remove', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.body;
    const { userId } = req.data;

    const comment = await Comment.findById(commentId).populate('post');

    const team = await Team.findById({ _id: new mongoose.Types.ObjectId(comment.post.team) });

    if (!team.admins.filter(el => el.equals(new mongoose.Types.ObjectId(userId))).length > 0 
        && !comment.owner.equals(userId) 
        || !team.owner.equals(userId)) {
      return res.status(404).json({ message: 'Something went wrong' });
    }

    await comment.remove();

    await Post.findOneAndUpdate(
      { _id: comment.post },
      { $pull: { comments: new mongoose.Types.ObjectId(comment._id) } },
    );

    await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { comments: new mongoose.Types.ObjectId(comment._id) } },
    );

    return res.status(200).json({ message: 'Comment Removed' });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
}) 

module.exports = router;