const { getGame, deleteGame } = require('../game/activeGames');
const db = require('../db');

module.exports = function initLobby(io) {
  io.on('connection', (socket) => {

    socket.on('join-game-room', ({ gameId, nick, userId }) => {
      const room = `game-${gameId}`;
      socket.join(room);

      socket.data.gameId = gameId;
      socket.data.userId = userId;
      socket.data.nick = nick;

      io.to(room).emit('chat-system', {
        message: `${nick} dołączył do czatu`
      });

      const clients = io.sockets.adapter.rooms.get(room);
      if (clients && clients.size >= 2) {
        io.to(room).emit('room-ready');
      }
    });

    socket.on('chat-message', ({ gameId, nick, message }) => {
      io.to(`game-${gameId}`).emit('chat-message', {
        nick,
        message,
        time: Date.now()
      });
    });

    socket.on('disconnect', () => {
      const { gameId, userId, nick } = socket.data;
      if (!gameId || !userId) return;

      const room = `game-${gameId}`;
      const game = getGame(gameId);

      if (!game) return;

      console.log(`Gracz ${nick} rozłączył się z gry ${gameId}`);

      const opponentId = game.players.find(id => id !== userId);
      if (!opponentId) return;

      db.run(`UPDATE users SET losses = losses + 1 WHERE id = ?`, [userId]);
      db.run(`UPDATE users SET wins = wins + 1 WHERE id = ?`, [opponentId]);

      io.to(room).emit('game-over-disconnect', {
        winner: opponentId,
        loser: userId
      });

      io.to(room).emit('chat-system', {
        message: `${nick} opuścił grę`
      });

      deleteGame(gameId);
    });

  });
};
