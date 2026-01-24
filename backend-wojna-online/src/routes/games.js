const express = require('express');
const auth = require('../middleware/auth');
const users = require('../data/users');


const { startGame, playRound, getWinner } = require('../game/game');
const {
  saveGame,
  getGame,
  deleteGame,
  getAllGames
} = require('../game/activeGames');

const router = express.Router();

/**
 * POST /games
 * Tworzy nową grę
 */
router.post('/', auth, (req, res) => {
  const { opponentId } = req.body;

  if (!opponentId) {
    return res.status(400).json({ message: 'Brak opponentId' });
  }

  const game = startGame(req.user.id, opponentId);
  saveGame(game);

  res.status(201).json({
    gameId: game.id,
    players: game.players
  });
});

/**
 * POST /games/:id/round
 * Rozgrywa jedną rundę
 */
router.post('/:id/round', auth, (req, res) => {
  const game = getGame(req.params.id);

  if (!game) {
    return res.status(404).json({ message: 'Gra nie istnieje' });
  }

  if (!game.players.includes(req.user.id)) {
    return res.status(403).json({ message: 'Nie jesteś graczem tej gry' });
  }

  const result = playRound(game);

   if (result.finished) {
   const winner = getWinner(game);
   const [p1, p2] = game.players;

   const user1 = users.find(u => u.id === p1);
   const user2 = users.find(u => u.id === p2);

   if (winner === p1) {
      user1.wins++;
      user2.losses++;
   } else if (winner === p2) {
      user2.wins++;
      user1.losses++;
   }

   deleteGame(game.id);

   return res.json({
      ...result,
      winner
   });
   }


  res.json(result);
});

/**
 * GET /games/:id
 * Stan gry
 */
router.get('/:id', auth, (req, res) => {
  const game = getGame(req.params.id);

  if (!game) {
    return res.status(404).json({ message: 'Gra nie istnieje' });
  }

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
