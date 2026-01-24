const { createDeck, shuffle } = require('./cards');

function startGame(player1, player2) {
  const deck = shuffle(createDeck());

  return {
    id: Date.now().toString(),
    players: [player1, player2],
    decks: {
      [player1]: deck.slice(0, 26),
      [player2]: deck.slice(26)
    },
    scores: {
      [player1]: 0,
      [player2]: 0
    },
    round: 0,
    finished: false
  };
}

function playRound(game) {
  if (game.finished) {
    throw new Error('Gra zakończona');
  }

  const [p1, p2] = game.players;

  const card1 = game.decks[p1].shift();
  const card2 = game.decks[p2].shift();

  game.round++;

  if (card1.value > card2.value) {
    game.scores[p1]++;
  } else if (card2.value > card1.value) {
    game.scores[p2]++;
  }

  if (game.decks[p1].length === 0) {
    game.finished = true;
  }

  return {
    round: game.round,
    cards: {
      [p1]: card1,
      [p2]: card2
    },
    scores: game.scores,
    finished: game.finished
  };
}

function getWinner(game) {
  const [p1, p2] = game.players;

  if (game.scores[p1] > game.scores[p2]) return p1;
  if (game.scores[p2] > game.scores[p1]) return p2;
  return null; // remis
}

module.exports = { startGame, playRound, getWinner };
