const activeGames = new Map();

function initializeGameState(game) {
  // przygotowanie struktury rundy
  game.currentRound = {
    plays: {
      [game.players[0]]: null,
      [game.players[1]]: null
    }
  };

  game.round = 1;

  // jeśli nie istnieją jeszcze wyniki
  if (!game.scores) {
    game.scores = {
      [game.players[0]]: 0,
      [game.players[1]]: 0
    };
  }

  return game;
}

function saveGame(game) {
  // przy pierwszym zapisie dodajemy strukturę rundy
  if (!game.currentRound) {
    game = initializeGameState(game);
  }

  activeGames.set(game.id, game);
}

function getGame(id) {
  return activeGames.get(id);
}

function deleteGame(id) {
  activeGames.delete(id);
}

function getAllGames() {
  return Array.from(activeGames.values());
}

module.exports = {
  saveGame,
  getGame,
  deleteGame,
  getAllGames
};
