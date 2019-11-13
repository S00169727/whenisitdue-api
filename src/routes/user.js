/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const hasher = require('../utils/hasher');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const {
      name, email,
    } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.status(500).json({
        error: 'User already exists',
      });
    }

    const newUser = await User.create({
      name,
      email,
      password: await hasher(req.body.password),
    });

    await newUser.save();

    return res.status(200).json({
      message: 'Registration successful',
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
});

router.post('/login', async (req, res, next) => {
  User.findOne({ email: req.body.email })
    .select('+password')
    .exec()
    .then((user) => {
      if (user) {
        bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
          if (err) {
            return res.status(401).json({
              message: 'Authentication failed',
            });
          }

          if (isMatch) {
            jwt.sign(
              { email: user.email, userId: user._id, isAdmin: user.isAdmin },
              'secretkey',
              (e, token) => {
                res.status(200).json({
                  messsge: 'Authentication was successful',
                  id: user._id,
                  token,
                });
              },
            );
          } else {
            return res.status(401).json({
              message: 'Authentication failed',
            });
          }
        });
      } else {
        return res.status(401).json({
          message: 'Authentication failed',
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.sendStatus(401).json({
        message: 'Authentication failed',
      });
    });
});

module.exports = router;
