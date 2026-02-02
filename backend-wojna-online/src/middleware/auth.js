const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Brak tokena' });

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, req.app.get('jwt-secret'));
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Nieprawidłowy token' });
  }
};
