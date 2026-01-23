const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Brak Authorization' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, req.app.get('jwt-secret'));
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Nieprawidłowy token' });
  }
};
