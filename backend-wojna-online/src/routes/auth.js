const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');


const users = require('../data/users');

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
      message: 'Nie znaleziono użytkownika w naszej bazie',
    });
  }

   const passwordMatch = bcrypt.compareSync(password, user.password);

   if (!passwordMatch) {
   return res.status(401).json({
      message: 'Nieprawidłowy email lub hasło',
   });
   }


  // login OK
  res.json({
    message: 'Zalogowano pomyślnie',
    user: {
      id: user.id,
      nick: user.nick,
      email: user.email,
      wins: user.wins,
      losses: user.losses,
    },
  });
});

module.exports = router;
