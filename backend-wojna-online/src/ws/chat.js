const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const rooms = {}; // gameId -> Set<WebSocket>

function initChat(server, app) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    const params = new URLSearchParams(req.url.replace('/?', ''));
    const token = params.get('token');
    const gameId = params.get('gameId');

    if (!token || !gameId) {
      ws.close();
      return;
    }

    try {
      const user = jwt.verify(token, app.get('jwt-secret'));
      ws.user = user;
    } catch {
      ws.close();
      return;
    }

    if (!rooms[gameId]) {
      rooms[gameId] = new Set();
    }

    rooms[gameId].add(ws);

    ws.on('message', (msg) => {
      // broadcast do pokoju
      for (const client of rooms[gameId]) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              userId: ws.user.id,
              message: msg.toString(),
            })
          );
        }
      }
    });

    ws.on('close', () => {
      rooms[gameId].delete(ws);
    });
  });
}

module.exports = initChat;
