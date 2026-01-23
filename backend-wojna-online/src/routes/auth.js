const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const users = require('../data/users');

const router = express.Router();

// POST /auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Nieprawidłowe dane' });
  }

  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: 'Nieprawidłowe dane' });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      nick: user.nick
    },
    req.app.get('jwt-secret'),
    { expiresIn: '1h' }
  );

  res.json({ token });
});

module.exports = router;
