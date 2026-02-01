'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import client from '@/lib/mqtt';
import { getUserIdFromToken } from '@/lib/auth';
import { joinGame } from '@/lib/api';

type RoundUpdate = {
  type: 'ROUND_UPDATE';
  round: number;
  plays: Record<number, any>;
  scores: Record<number, number>;
};

type RoundResult = {
  type: 'ROUND_RESULT';
  round: number;
  cards: Record<number, any>;
  winner: number | null;
  scores: Record<number, number>;
};

type GameOver = {
  type: 'GAME_OVER';
  winner: number;
  scores: Record<number, number>;
};

type GameMessage = RoundUpdate | RoundResult | GameOver;

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;

  const [userId, setUserId] = useState<number | null>(null);
  const [round, setRound] = useState<number>(1);
  const [plays, setPlays] = useState<Record<number, any>>({});
  const [scores, setScores] = useState<Record<number, number>>({});
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [gameOver, setGameOver] = useState<GameOver | null>(null);

  // odczyt userId z JWT po stronie przeglądarki
  useEffect(() => {
    const id = getUserIdFromToken();
    setUserId(id);
  }, []);

   useEffect(() => {
   const id = getUserIdFromToken();
   console.log('USER ID FROM TOKEN:', id);
   setUserId(id);
   }, []);

   useEffect(() => {
      const join = async () => {
         const token = localStorage.getItem('token');
         if (!token) return;

         await joinGame(gameId, token);
      };

      if (gameId) join();
      }, [gameId]);


  // subskrypcja MQTT
  useEffect(() => {
    if (!gameId) return;

    const topic = `game/${gameId}/state`;
    client.subscribe(topic);

    const handler = (t: string, message: Buffer) => {
      if (t !== topic) return;

      const data: GameMessage = JSON.parse(message.toString());

      if (data.type === 'ROUND_UPDATE') {
        setRound(data.round);
        setPlays(data.plays);
        setScores(data.scores);
        setLastResult(null);
      }

      if (data.type === 'ROUND_RESULT') {
        setRound(data.round);
        setPlays({});
        setScores(data.scores);
        setLastResult(data);
      }

      if (data.type === 'GAME_OVER') {
        setGameOver(data);
        setScores(data.scores);
      }
    };

    client.on('message', handler);

    return () => {
      client.unsubscribe(topic);
      client.off('message', handler);
    };
  }, [gameId]);

   const playCard = () => {
   console.log('BUTTON CLICKED');
   console.log('userId =', userId);
   console.log('gameOver =', gameOver);

   if (!userId || gameOver) {
      console.log('BLOCKED');
      return;
   }

   console.log('SENDING MQTT');

   client.publish(
      `game/${gameId}/action`,
      JSON.stringify({
         type: 'PLAY_CARD',
         playerId: userId
      })
   );
   };


  const myCard = userId ? plays[userId] : null;
  const opponentCard =
    userId && plays
      ? Object.entries(plays).find(([id]) => Number(id) !== userId)?.[1]
      : null;

  return (
    <main style={{ padding: 20 }}>
      <h1>Gra ID: {gameId}</h1>

      <p>Runda: {round}</p>

      <button onClick={playCard} disabled={!userId || !!gameOver}>
        Zagraj kartę
      </button>

      <h2>Twoja karta</h2>
      <pre>{myCard ? JSON.stringify(myCard, null, 2) : '—'}</pre>

      <h2>Karta przeciwnika</h2>
      <pre>{opponentCard ? JSON.stringify(opponentCard, null, 2) : '—'}</pre>

      <h2>Punkty</h2>
      <pre>{JSON.stringify(scores, null, 2)}</pre>

      {lastResult && (
        <>
          <h2>Wynik rundy</h2>
          <pre>{JSON.stringify(lastResult.cards, null, 2)}</pre>
          <p>
            Zwycięzca rundy:{' '}
            {lastResult.winner === null ? 'Remis' : `Gracz ${lastResult.winner}`}
          </p>
        </>
      )}

      {gameOver && (
        <>
          <h2>Koniec gry</h2>
          <p>Zwycięzca gry: Gracz {gameOver.winner}</p>
        </>
      )}
    </main>
  );
}
