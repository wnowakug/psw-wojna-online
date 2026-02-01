function initLobby(io) {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-game-room', (gameId) => {
      socket.join(`game:${gameId}`);
      console.log(`Socket ${socket.id} joined room game:${gameId}`);

      // informujemy innych w pokoju
      socket.to(`game:${gameId}`).emit('player-joined');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
}

module.exports = initLobby;
