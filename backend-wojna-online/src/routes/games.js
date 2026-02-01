const express = require('express');
const auth = require('../middleware/auth');

const { createDeck } = require('../game/game');
const {
  saveGame,
  getGame,
  getAllGames
} = require('../game/activeGames');

const router = express.Router();

/**
 * POST /games
 * Tworzy nową grę z jednym graczem (czeka na drugiego)
 */
router.post('/', auth, (req, res) => {
  const userId = req.user.id;

  const game = {
    id: Date.now().toString(),
    players: [userId],
    decks: {},              // talie rozdamy dopiero gdy będzie 2 graczy
    scores: {
      [userId]: 0           // 🔥 zawsze start od 0
    },
    currentRound: {
      plays: {
        [userId]: null
      }
    },
    round: 1
  };

  saveGame(game);
  res.json(game);
});

/**
 * POST /games/:id/join
 * Drugi gracz dołącza do gry
 */
router.post('/:id/join', auth, (req, res) => {
  const game = getGame(req.params.id);
  if (!game) return res.status(404).json({ message: 'Gra nie istnieje' });

  const userId = req.user.id;

  if (game.players.includes(userId)) {
    return res.json(game);
  }

  if (game.players.length >= 2) {
    return res.status(400).json({ message: 'Gra jest pełna' });
  }

  // ➕ Dodajemy drugiego gracza
  game.players.push(userId);

  // 🔥 Inicjalizacja punktów i plays
  game.scores[userId] = 0;
  game.currentRound.plays[userId] = null;

  // 🎴 Gdy mamy już 2 graczy — rozdajemy karty
  if (game.players.length === 2) {
    const deck = createDeck();
    const half = Math.floor(deck.length / 2);

    const [p1, p2] = game.players;

    game.decks[p1] = deck.slice(0, half);
    game.decks[p2] = deck.slice(half);
  }

  res.json(game);
});

/**
 * GET /games/:id
 * Pobiera stan gry
 */
router.get('/:id', auth, (req, res) => {
  const game = getGame(req.params.id);
  if (!game) return res.status(404).json({ message: 'Gra nie istnieje' });

  res.json(game);
});

/**
 * GET /games
 * Lista aktywnych gier
 */
router.get('/', auth, (req, res) => {
  res.json(getAllGames());
});

module.exports = router;
