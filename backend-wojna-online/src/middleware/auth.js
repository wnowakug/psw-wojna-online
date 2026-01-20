const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      message: 'Brak nagłówka Authorization',
    });
  }

  const token = authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      message: 'Brak tokena',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      req.app.get('jwt-secret')
    );

    req.user = decoded; // zapisujemy dane użytkownika
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Nieprawidłowy lub wygasły token',
    });
  }
}

module.exports = authMiddleware;
