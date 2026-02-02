'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import client from '@/lib/mqtt';
import { getUserIdFromToken } from '@/lib/auth';
import { joinGame, getUserById, getGame } from '@/lib/api';
import { io } from 'socket.io-client';

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

function getCardImage(card: any): string | null {
  if (!card) return null;

  const rankMap: Record<number, string> = {
    11: 'jack',
    12: 'queen',
    13: 'king',
    14: 'ace'
  };

  const rank =
    card.value <= 10 ? card.value.toString() : rankMap[card.value];

  return `/images/${rank}_of_${card.suit}.png`;
}



export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;

  const [userId, setUserId] = useState<number | null>(null);
  const [round, setRound] = useState<number>(1);
  const [plays, setPlays] = useState<Record<number, any>>({});
  const [scores, setScores] = useState<Record<number, number>>({});
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [gameOver, setGameOver] = useState<GameOver | null>(null);
  const [ready, setReady] = useState(false);
  const [myNick, setMyNick] = useState('');
  const [opponentNick, setOpponentNick] = useState('');

  // USER ID z JWT
  useEffect(() => {
    const id = getUserIdFromToken();
    setUserId(id);
  }, []);

  // SOCKET.IO – pokój gry
   useEffect(() => {
      if (!gameId || !userId) return;

      const socket = io('http://localhost:4000');

      socket.emit('join-game-room', gameId);

      socket.on('room-ready', () => {
         console.log('Obaj gracze gotowi');
         setReady(true);
      });

      return () => {
         socket.disconnect(); // cleanup
      };
   }, [gameId, userId]);



  // DOŁĄCZENIE DO GRY (REST)
  useEffect(() => {
    const join = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      await joinGame(gameId, token);
    };

    if (gameId) join();
  }, [gameId]);

  // POBRANIE NICKÓW GRACZY
   useEffect(() => {
   const fetchPlayers = async () => {
      const token = localStorage.getItem('token');
      if (!token || !userId) return;

      const game = await getGame(gameId, token);

      if (game.players.length < 2) {
         setTimeout(fetchPlayers, 1000);
         return;
      }

      const opponentId = game.players.find((id: number) => id !== userId);
      if (!opponentId) return;

      const me = await getUserById(userId);
      const opponent = await getUserById(opponentId);

      setMyNick(me.nick);
      setOpponentNick(opponent.nick);
   };

   fetchPlayers();
   }, [gameId, userId]);


  // MQTT SUBSKRYPCJA STANU GRY
  useEffect(() => {
    if (!gameId) return;

    const topic = `game/${gameId}/state`;
    client.subscribe(topic);

    const handler = (t: string, message: any) => {
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
    if (!userId || gameOver || !ready) return;

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

      {!ready && <p>Oczekiwanie na drugiego gracza...</p>}

      <p>Runda: {round}</p>

      <button onClick={playCard} disabled={!userId || !!gameOver || !ready}>
        Zagraj kartę
      </button>

      <h2>Twoja karta ({myNick})</h2>
      {myCard ? (
        <img
          src={getCardImage(myCard)!}
          alt="Twoja karta"
          style={{ width: 120 }}
        />
      ) : (
        <p>—</p>
      )}

      <h2>Karta przeciwnika ({opponentNick})</h2>
      {opponentCard ? (
        <img
          src={getCardImage(opponentCard)!}
          alt="Karta przeciwnika"
          style={{ width: 120 }}
        />
      ) : (
        <p>—</p>
      )}


      <h2>Punkty</h2>
      <ul>
      <li>{myNick}: {userId ? scores[userId] ?? 0 : 0}</li>
      <li>{opponentNick}: {
         userId
            ? scores[Number(Object.keys(scores).find(id => Number(id) !== userId))] ?? 0
            : 0
      }</li>
      </ul>


      {lastResult && (
      <>
        <h2>Wynik rundy</h2>
        <div style={{ display: 'flex', gap: 20 }}>
          {Object.entries(lastResult.cards).map(([playerId, card]) => (
            <div key={playerId} style={{ textAlign: 'center' }}>
              <img
                src={getCardImage(card)!}
                alt="Karta z rundy"
                style={{ width: 100 }}
              />
              <p>{Number(playerId) === userId ? myNick : opponentNick}</p>
            </div>
          ))}
        </div>
      </>
    )}

      {gameOver && (
        <>
          <h2>Koniec gry</h2>
          <p>
            Zwycięzca gry:{' '}
            {gameOver.winner === userId ? myNick : opponentNick}
          </p>
        </>
      )}
    </main>
  );
}
