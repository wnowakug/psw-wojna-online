const mqtt = require('mqtt');
const { getGame, deleteGame } = require('../game/activeGames');
const users = require('../data/users');
const db = require('../db');

console.log('GAME MQTT FILE LOADED');


function initGameMQTT() {
  const client = mqtt.connect('mqtt://localhost:1883');

  client.on('connect', () => {
    console.log('MQTT connected (game)');
    client.subscribe('game/+/action');
  });

  client.on('message', (topic, message) => {
    const match = topic.match(/^game\/(.+)\/action$/);
    if (!match) return;

    const gameId = match[1];
    const game = getGame(gameId);
    if (!game) return;

    let payload;
    try {
      payload = JSON.parse(message.toString());
    } catch {
      return;
    }

    // GRACZ ZAGRYWA KARTĘ
    if (payload.type !== 'PLAY_CARD') return;

    const playerId = payload.playerId;
    if (!playerId) return;
    if (!game.players.includes(playerId)) return;

    // jeśli gracz już zagrał w tej rundzie
    if (game.currentRound.plays[playerId]) return;

    // dobierz kartę
    const card = game.decks[playerId].shift();
    game.currentRound.plays[playerId] = card;

    // wysyłamy stan częściowy
    client.publish(
      `game/${gameId}/state`,
      JSON.stringify({
        type: 'ROUND_UPDATE',
        round: game.round,
        plays: game.currentRound.plays,
        scores: game.scores
      })
    );

    const [p1, p2] = game.players;
    const c1 = game.currentRound.plays[p1];
    const c2 = game.currentRound.plays[p2];

    // czekamy aż obaj zagrają
    if (!c1 || !c2) return;

    // rozstrzygnięcie rundy
    let roundWinner = null;

    if (c1.value > c2.value) {
      game.scores[p1]++;
      roundWinner = p1;
    } else if (c2.value > c1.value) {
      game.scores[p2]++;
      roundWinner = p2;
    }

    client.publish(
      `game/${gameId}/state`,
      JSON.stringify({
        type: 'ROUND_RESULT',
        round: game.round,
        cards: { [p1]: c1, [p2]: c2 },
        winner: roundWinner,
        scores: game.scores
      })
    );

    // reset rundy
    game.currentRound.plays[p1] = null;
    game.currentRound.plays[p2] = null;
    game.round++;

    // koniec gry
    if (game.round > 26) {
      const finalWinner =
        game.scores[p1] > game.scores[p2] ? p1 : p2;

      const loser = finalWinner === p1 ? p2 : p1;

      // aktualizacja w bazie
      db.run(`UPDATE users SET wins = wins + 1 WHERE id = ?`, [finalWinner]);
      db.run(`UPDATE users SET losses = losses + 1 WHERE id = ?`, [loser]);

      client.publish(
        `game/${gameId}/state`,
        JSON.stringify({
          type: 'GAME_OVER',
          winner: finalWinner,
          scores: game.scores
        })
      );

      deleteGame(gameId);
    }

    });
  }

module.exports = initGameMQTT;
