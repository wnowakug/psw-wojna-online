module.exports = function initLobby(io) {
  io.on('connection', (socket) => {

    socket.on('join-game-room', ({ gameId, nick }) => {
      socket.join(`game-${gameId}`);

      //Powiadom innych graczy w pokoju
      socket.to(`game-${gameId}`).emit('chat-system', {
        message: `${nick} dołączył do chatu`
      });
    });

    socket.on('chat-message', ({ gameId, nick, message }) => {
      io.to(`game-${gameId}`).emit('chat-message', {
        nick,
        message
      });
    });

    socket.on('disconnecting', () => {
      const rooms = Array.from(socket.rooms);

      rooms.forEach(room => {
        if (room.startsWith('game-')) {
          socket.to(room).emit('chat-system', {
            message: `Gracz opuścił czat`
          });
        }
      });
    });

  });
};
