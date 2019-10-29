const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const bearerHeader = req.headers.authorization;
    if (typeof bearerHeader !== 'undefined') {
      const token = bearerHeader.split(' ')[1];
      req.data = jwt.verify(token, 'secretkey');
      next();
    } else {
      return res.status(401).json({
        message: 'Authentication failed',
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: 'Authentication failed',
    });
  }
};
