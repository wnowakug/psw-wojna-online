const activeGames = new Map();

function saveGame(game) {
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
