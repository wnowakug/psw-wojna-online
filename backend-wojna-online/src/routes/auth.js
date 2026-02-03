const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); 

const router = express.Router();

// POST /auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log("LOGIN ATTEMPT:", email, password);

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Błąd serwera' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Nieprawidłowe dane' });
    }
    //porównywanie zhashowanego hasła z podanym
    const match = bcrypt.compareSync(password, user.password);
    console.log("PASSWORD MATCH:", match);

    if (!match) {
      return res.status(401).json({ message: 'Nieprawidłowe dane' });
    }

    //generowanie tokenu jwt gdy dane się zgadzają
    const token = jwt.sign(
      { id: user.id, email: user.email, nick: user.nick },
      req.app.get('jwt-secret'),
      { expiresIn: '24h' }
    );

    console.log("TOKEN GENERATED:", token);

    res.json({ token });
  });
});

const authMiddleware = require('../middleware/auth'); // middleware z JWT

// GET /auth/me
router.get('/me', authMiddleware, (req, res) => {
  db.get(
    `SELECT id, nick, email, wins, losses FROM users WHERE id = ?`,
    [req.user.id],
    (err, user) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    }
  );
});


module.exports = router;
