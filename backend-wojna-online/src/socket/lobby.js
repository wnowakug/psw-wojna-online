module.exports = function initLobby(io) {
  io.on('connection', (socket) => {

    socket.on('join-game-room', (gameId) => {
      const roomName = `game:${gameId}`;
      socket.join(roomName);

      const room = io.sockets.adapter.rooms.get(roomName);
      const size = room ? room.size : 0;

      // gdy są 2 osoby — obie dostają sygnał startu
      if (size === 2) {
        io.to(roomName).emit('room-ready');
      }
    });

  });
};
