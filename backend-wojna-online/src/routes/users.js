const express = require('express');
const router = express.Router();

const users = [];

router.post('/', (req, res) => {
  // 👇 DIAGNOSTYCZNY LOG
  console.log('REQ.BODY >>>', req.body);

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

  const newUser = {
    id: users.length + 1,
    nick,
    email,
    password,
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

module.exports = router;
