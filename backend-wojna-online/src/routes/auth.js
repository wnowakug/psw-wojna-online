const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const users = require('../data/users');

const authMiddleware = require('../middleware/auth');


// POST /auth/login
router.post('/login', (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      message: 'Brak body w request',
    });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email i hasło są wymagane',
    });
  }

  // szukamy użytkownika
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({
      message: 'Nieprawidłowy email lub hasło',
    });
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({
      message: 'Nieprawidłowy email lub hasło',
    });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    req.app.get('jwt-secret'),
    { expiresIn: '1h' }
  );

  res.json({
    message: 'Zalogowano pomyślnie',
    token,
  });
});

module.exports = router;

router.get('/me', authMiddleware, (req, res) => {
  res.json({
    user: req.user,
  });
});

