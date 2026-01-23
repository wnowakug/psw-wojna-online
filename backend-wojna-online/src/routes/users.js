const express = require('express');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const users = require('../data/users');

const router = express.Router();

// POST /users — rejestracja
router.post('/', (req, res) => {
  const { nick, email, password } = req.body;

  if (!nick || !email || !password) {
    return res.status(400).json({ message: 'Brak danych' });
  }

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(400).json({ message: 'Email już istnieje' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: users.length + 1,
    nick,
    email,
    password: hashedPassword,
    wins: 0,
    losses: 0
  };

  users.push(newUser);

  res.status(201).json({
    id: newUser.id,
    nick: newUser.nick,
    email: newUser.email
  });
});

// GET /users/me — PROFIL
router.get('/me', auth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
  }

  res.json({
    nick: user.nick,
    email: user.email,
    wins: user.wins,
    losses: user.losses
  });
});

module.exports = router;
