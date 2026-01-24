// KARTA
function Card(suit, value) {
  return { suit, value };
}

// STAN GRY
function GameState(id, players, decks) {
  return {
    id,
    players,     // [playerId1, playerId2]
    decks,       // { playerId: Card[] }
    scores: {
      [players[0]]: 0,
      [players[1]]: 0
    },
    round: 0,
    finished: false
  };
}

module.exports = {
  Card,
  GameState
};
