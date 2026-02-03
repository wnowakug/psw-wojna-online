const jwt = require('jsonwebtoken');

// Middleware autoryzacyjny sprawdzający token JWT
module.exports = (req, res, next) => {

  // Pobranie nagłówka Authorization z żądania
  const header = req.headers.authorization;

  if (!header) return res.status(401).json({ message: 'Brak tokena' });

  // Nagłówek ma format: "Bearer TOKEN"
  const token = header.split(' ')[1];

  try {
    // Weryfikacja tokena przy użyciu sekretu
    const decoded = jwt.verify(token, req.app.get('jwt-secret'));

    req.user = decoded;

    next();

  } catch {
    res.status(401).json({ message: 'Nieprawidłowy token' });
  }
};
