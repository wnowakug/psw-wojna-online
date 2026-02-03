const mqtt = require('mqtt');
const { getGame, deleteGame } = require('../game/activeGames');
const db = require('../db');

console.log('GAME MQTT FILE LOADED');

function initGameMQTT() {
  // Połączenie z brokerem MQTT
  const client = mqtt.connect('mqtt://localhost:1883');

  // Po nawiązaniu połączenia subskrybujemy akcje graczy
  client.on('connect', () => {
    console.log('MQTT connected (game)');
    client.subscribe('game/+/action');
  });

  // Obsługa wszystkich wiadomości przychodzących z MQTT
  client.on('message', (topic, message) => {

    // Wyciągamy ID gry z tematu
    const match = topic.match(/^game\/(.+)\/action$/);
    if (!match) return;

    const gameId = match[1];
    const game = getGame(gameId); // pobranie gry z pamięci serwera
    if (!game) return;

    // Parsowanie payloadu
    let payload;
    try {
      payload = JSON.parse(message.toString());
    } catch {
      return;
    }

    // Interesuje nas tylko akcja zagrania karty
    if (payload.type !== 'PLAY_CARD') return;

    const playerId = payload.playerId;
    if (!playerId || !game.players.includes(playerId)) return;

    // Zabezpieczenie przed wielokrotnym zagraniem w tej samej rundzie
    if (game.currentRound.plays[playerId]) return;

    // Aktualizacja stanu gry w pamięci
    const card = game.decks[playerId].shift();
    game.currentRound.plays[playerId] = card;

    // Wysyłamy częściowy stan gry do wszystkich klientów
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

    // Czekamy aż obaj gracze wykonają ruch
    if (!c1 || !c2) return;

    let roundWinner = null;

    // Aktualizacja punktów w pamięci
    if (c1.value > c2.value) {
      game.scores[p1]++;
      roundWinner = p1;
    } else if (c2.value > c1.value) {
      game.scores[p2]++;
      roundWinner = p2;
    }

    // Wysyłamy wynik rundy do klientów
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

    // Opóźnienie przed przejściem do kolejnej rundy
    setTimeout(() => {
      game.currentRound.plays[p1] = null;
      game.currentRound.plays[p2] = null;
      game.round++;

      // Sprawdzenie czy gra dobiegła końca
      if (game.round > 26) {
        const finalWinner =
          game.scores[p1] > game.scores[p2] ? p1 : p2;

        const loser = finalWinner === p1 ? p2 : p1;

        // Aktualizacja statystyk w bazie danych
        db.run(`UPDATE users SET wins = wins + 1 WHERE id = ?`, [finalWinner]);
        db.run(`UPDATE users SET losses = losses + 1 WHERE id = ?`, [loser]);

        // Informacja o zakończeniu gry
        client.publish(
          `game/${gameId}/state`,
          JSON.stringify({
            type: 'GAME_OVER',
            winner: finalWinner,
            scores: game.scores
          })
        );

        // Usunięcie gry z pamięci serwera
        deleteGame(gameId);
        return;
      }

      // Publikacja nowego stanu rundy
      client.publish(
        `game/${gameId}/state`,
        JSON.stringify({
          type: 'ROUND_UPDATE',
          round: game.round,
          plays: game.currentRound.plays,
          scores: game.scores
        })
      );

    }, 1000);
  });
}

module.exports = initGameMQTT;
