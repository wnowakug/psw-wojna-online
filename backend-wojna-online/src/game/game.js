function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = [2,3,4,5,6,7,8,9,10,11,12,13,14];
  const deck = [];

  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }

  return deck.sort(() => Math.random() - 0.5);
}

function createGame(players) {
  return {
    id: Date.now().toString(),
    players,
    decks: {},
    currentRound: { plays: {} },
    scores: {},
    round: 1
  };
}

module.exports = {
  createGame,
  createDeck 
};
