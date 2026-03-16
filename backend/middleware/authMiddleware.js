const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const splitToken = token.split(' ');
    const finalToken = splitToken[1] || token;
    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
