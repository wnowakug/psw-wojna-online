const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Tymczasowa „baza danych” w pamięci
const users = require('../data/users');   


// CREATE — POST /users
router.post('/', (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      message: 'Brak body w request',
    });
  }

  const { nick, email, password } = req.body;

  if (!nick || !email || !password) {
    return res.status(400).json({
      message: 'Brak wymaganych pól',
    });
  }

   const hashedPassword = bcrypt.hashSync(password, 10);

   const newUser = {
   id: users.length + 1,
   nick,
   email,
   password: hashedPassword,
   wins: 0,
   losses: 0,
   };

  users.push(newUser);

  res.status(201).json({
    id: newUser.id,
    nick: newUser.nick,
    email: newUser.email,
  });
});

// READ — GET /users
router.get('/', (req, res) => {
  const safeUsers = users.map(user => ({
    id: user.id,
    nick: user.nick,
    email: user.email,
    wins: user.wins,
    losses: user.losses,
  }));

  res.json(safeUsers);
});

module.exports = router;
