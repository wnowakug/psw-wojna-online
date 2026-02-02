const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

//
// 🔹 POST /users — rejestracja
//
router.post('/', async (req, res) => {
  const { nick, email, password } = req.body;

  if (!nick || !email || !password) {
    return res.status(400).json({ message: 'Wszystkie pola są wymagane' });
  }

  db.get(`SELECT id FROM users WHERE email = ?`, [email], async (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Błąd serwera' });
    }

    if (row) {
      return res.status(409).json({
        message: 'Do tego adresu email jest już przypisane konto'
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.run(
        `INSERT INTO users (nick, email, password, wins, losses)
         VALUES (?, ?, ?, 0, 0)`,
        [nick, email, hashedPassword],
        function (err) {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Błąd zapisu do bazy' });
          }

          res.status(201).json({ message: 'Konto utworzone' });
        }
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Błąd haszowania hasła' });
    }
  });
});

//
// 🔹 GET /users/me — profil zalogowanego użytkownika
//
router.get('/me', auth, (req, res) => {
  db.get(
    `SELECT id, nick, email, wins, losses FROM users WHERE id = ?`,
    [req.user.id],
    (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Błąd bazy danych' });
      }

      if (!user) {
        return res.status(404).json({ message: 'Użytkownik nie istnieje' });
      }

      res.json(user);
    }
  );
});

//
// 🔹 GET /users/:id — dane użytkownika po ID (np. do wyświetlania nicku przeciwnika)
//
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT id, nick, wins, losses FROM users WHERE id = ?`,
    [id],
    (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Błąd bazy danych' });
      }

      if (!user) {
        return res.status(404).json({ message: 'Użytkownik nie istnieje' });
      }

      res.json(user);
    }
  );
});

module.exports = router;
