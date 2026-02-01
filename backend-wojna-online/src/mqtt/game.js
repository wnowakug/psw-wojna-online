const mqtt = require('mqtt');

const { playRound, getWinner } = require('../game/game');
const { getGame, deleteGame } = require('../game/activeGames');
const users = require('../data/users');

function initGameMQTT() {
  const client = mqtt.connect('mqtt://localhost:1883');

  client.on('connect', () => {
    console.log('MQTT connected');
    client.subscribe('game/+/action');
  });

  client.on('message', (topic, message) => {
    const match = topic.match(/^game\/(.+)\/action$/);
    if (!match) return;

    const gameId = match[1];
    const game = getGame(gameId);
    if (!game) return;

    try {
      const payload = JSON.parse(message.toString());

      if (payload.type !== 'PLAY_ROUND') return;

      const result = playRound(game);

      if (result.finished) {
        const winner = getWinner(game);
        const [p1, p2] = game.players;

        const u1 = users.find(u => u.id === p1);
        const u2 = users.find(u => u.id === p2);

        if (winner === p1) {
          u1.wins++;
          u2.losses++;
        } else if (winner === p2) {
          u2.wins++;
          u1.losses++;
        }

        deleteGame(game.id);

        client.publish(
          `game/${gameId}/state`,
          JSON.stringify({ ...result, winner })
        );

        return;
      }

      client.publish(
        `game/${gameId}/state`,
        JSON.stringify(result)
      );
    } catch (err) {
      console.error('MQTT game error:', err.message);
    }
  });
}

module.exports = initGameMQTT;
