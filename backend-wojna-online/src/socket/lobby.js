const { getGame, deleteGame } = require('../game/activeGames');
const db = require('../db');

module.exports = function initLobby(io) {

  // Nasłuch połączeń WebSocket od klientów
  io.on('connection', (socket) => {

    // Gracz dołącza do pokoju konkretnej gry
    socket.on('join-game-room', ({ gameId, nick, userId }) => {
      const room = `game-${gameId}`;
      socket.join(room); // dołączenie do pokoju socket.io

      // Zapamiętujemy dane gracza w obiekcie socket (przydadzą się przy disconnect)
      socket.data.gameId = gameId;
      socket.data.userId = userId;
      socket.data.nick = nick;

      // Systemowa wiadomość na czacie o dołączeniu gracza
      io.to(room).emit('chat-system', {
        message: `${nick} dołączył do czatu`
      });

      // Jeśli w pokoju są już 2 osoby, gra może się rozpocząć
      const clients = io.sockets.adapter.rooms.get(room);
      if (clients && clients.size >= 2) {
        io.to(room).emit('room-ready');
      }
    });

    // Obsługa zwykłych wiadomości czatu między graczami
    socket.on('chat-message', ({ gameId, nick, message }) => {
      io.to(`game-${gameId}`).emit('chat-message', {
        nick,
        message,
        time: Date.now() // znacznik czasu wiadomości
      });
    });

    // Gdy gracz zamknie stronę / straci połączenie
    socket.on('disconnect', () => {
      const { gameId, userId, nick } = socket.data;
      if (!gameId || !userId) return;

      const room = `game-${gameId}`;
      const game = getGame(gameId);
      if (!game) return;

      console.log(`Gracz ${nick} rozłączył się z gry ${gameId}`);

      // Szukamy ID przeciwnika
      const opponentId = game.players.find(id => id !== userId);
      if (!opponentId) return;

      // Aktualizacja statystyk w bazie: wychodzący przegrywa, przeciwnik wygrywa
      db.run(`UPDATE users SET losses = losses + 1 WHERE id = ?`, [userId]);
      db.run(`UPDATE users SET wins = wins + 1 WHERE id = ?`, [opponentId]);

      // Informacja dla drugiego gracza o wygranej walkowerem
      io.to(room).emit('game-over-disconnect', {
        winner: opponentId,
        loser: userId
      });

      // Komunikat systemowy na czacie
      io.to(room).emit('chat-system', {
        message: `${nick} opuścił grę`
      });

      // Usuwamy grę z aktywnych gier w pamięci serwera
      deleteGame(gameId);
    });

  });
};
