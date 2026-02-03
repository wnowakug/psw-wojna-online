'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import client from '@/lib/mqtt';
import { getUserIdFromToken } from '@/lib/auth';
import { joinGame, getUserById, getGame } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import Image from 'next/image';

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

type DisconnectGameOver = {
  winner: number;
  loser: number;
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

  const rank = card.value <= 10 ? card.value.toString() : rankMap[card.value];
  return `/images/${rank}_of_${card.suit}.png`;
}

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;

  const [userId, setUserId] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [plays, setPlays] = useState<Record<number, any>>({});
  const [scores, setScores] = useState<Record<number, number>>({});
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [roundCards, setRoundCards] = useState<Record<number, any> | null>(null);
  const [gameOver, setGameOver] = useState<GameOver | null>(null);
  const [ready, setReady] = useState(false);
  const [myNick, setMyNick] = useState('');
  const [opponentNick, setOpponentNick] = useState('');
  const [opponentId, setOpponentId] = useState<number | null>(null);
  const [revealed, setRevealed] = useState({ me: false, opponent: false });

  const [chatMessages, setChatMessages] = useState<
    { nick: string; message: string; time: number }[]
  >([]);
  const [chatInput, setChatInput] = useState('');

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    setUserId(getUserIdFromToken());
  }, []);

  useEffect(() => {
    if (!gameId) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    joinGame(gameId, token);
  }, [gameId]);

  useEffect(() => {
    if (!gameId || !userId) return;

    const fetchPlayers = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const game = await getGame(gameId, token);
      if (game.players.length < 2) {
        setTimeout(fetchPlayers, 1000);
        return;
      }

      const oppId = game.players.find((id: number) => id !== userId);
      if (!oppId) return;

      const me = await getUserById(userId);
      const opponent = await getUserById(oppId);

      setMyNick(me.nick);
      setOpponentNick(opponent.nick);
      setOpponentId(oppId);  

    };

    fetchPlayers();
  }, [gameId, userId]);

  useEffect(() => {
    if (!gameId || !myNick) return;

    const socket = io('http://localhost:4000');
    socketRef.current = socket;

    socket.emit('join-game-room', { gameId, nick: myNick, userId });

    socket.on('room-ready', () => setReady(true));

    socket.on('chat-message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on('chat-system', (msg) => {
      setChatMessages((prev) => [
        ...prev,
        { nick: 'SYSTEM', message: msg.message, time: Date.now() }
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [gameId, myNick]);

  useEffect(() => {
    if (!gameId || !userId) return;

    const topic = `game/${gameId}/state`;
    client.subscribe(topic);

    const handler = (t: string, message: any) => {
      if (t !== topic) return;
      const data: GameMessage = JSON.parse(message.toString());

      if (data.type === 'ROUND_UPDATE') {
        const entries = Object.entries(data.plays);

        const myPlay = entries.find(([id]) => Number(id) === userId)?.[1];
        const opponentPlay = entries.find(([id]) => Number(id) !== userId)?.[1];

        setRevealed({
          me: !!myPlay,
          opponent: !!opponentPlay
        });
        
        setRound(data.round);
        setPlays(data.plays);
        setScores(data.scores);
      }

      if (data.type === 'ROUND_RESULT') {
        setRound(data.round);
        setScores(data.scores);
        setLastResult(data);
        setRoundCards(data.cards);

        // pokazujemy odkryte karty z tej rundy
        setRevealed({ me: true, opponent: true });
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
  }, [gameId, userId, round]);

  const scoresRef = useRef(scores);

  useEffect(() => {
    scoresRef.current = scores;
  }, [scores]);


  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleDisconnectGameOver = (data: { winner: number; loser: number }) => {
      setGameOver({
        type: 'GAME_OVER',
        winner: data.winner,
        scores: scoresRef.current   // patrz niżej 👇
      });

      alert('Przeciwnik opuścił grę — wygrywasz walkowerem!');
    };

    socket.on('game-over-disconnect', handleDisconnectGameOver);

    return () => {
      socket.off('game-over-disconnect', handleDisconnectGameOver);
    };
  }, []);



  const playCard = () => {
    if (!userId || gameOver || !ready) return;
    client.publish(
      `game/${gameId}/action`,
      JSON.stringify({ type: 'PLAY_CARD', playerId: userId })
    );
  };

  const sendMessage = () => {
    if (!chatInput.trim() || !socketRef.current) return;
    socketRef.current.emit('chat-message', { gameId, nick: myNick, message: chatInput });
    setChatInput('');
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

      <div className="card-area">
        <div className="nick-and-card">
          <h2>Twoja karta ({myNick})</h2>
          <div className="card-wrapper">
            <div className="card" data-flipped={revealed.me}>
              {/* TYŁ KARTY */}
              <div className="card-face card-back">
                <Image
                  src="/images/reverse.png"
                  alt="Rewers"
                  width={120}
                  height={174}
                />
              </div>

              <div className="card-face card-front">
                {/* PRZÓD KARTY*/}
                <Image
                  src={getCardImage(myCard) || '/images/reverse.png'}
                  alt="Twoja karta"
                  width={120}
                  height={174}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="nick-and-card">
          <h2>Karta przeciwnika ({opponentNick})</h2>
          <div className="card-wrapper">
            <div className="card" data-flipped={revealed.opponent}>
              {/* TYŁ KARTY */}
              <div className="card-face card-back">
                <Image
                  src="/images/reverse.png"
                  alt="Rewers karty"
                  width={120}
                  height={174}
                />
              </div>

              {/* PRZÓD KARTY*/}
              <div className="card-face card-front">
                <Image
                  src={getCardImage(opponentCard) || '/images/reverse.png'}
                  alt="Karta przeciwnika"
                  width={120}
                  height={174}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className="playButton" onClick={playCard} disabled={!userId || !!gameOver || !ready}>
        Zagraj kartę
      </button>

      <h2>Punkty</h2>
      <ul>
        <li>{myNick}: {userId != null ? scores[userId] ?? 0 : 0}</li>
        <li>{opponentNick}: {opponentId != null ? scores[opponentId] ?? 0 : 0}</li>

      </ul>

      {lastResult && roundCards && (
        <>
          <h2>Wynik rundy</h2>
          <p>
            <strong>Zwycięzca rundy:</strong>{' '}
            {lastResult.winner === null
              ? 'Remis'
              : lastResult.winner === userId
              ? myNick
              : opponentNick}
          </p>

          <div style={{ display: 'flex', gap: 30 }}>
            {Object.entries(roundCards).map(([pid, card]) => (
              <div key={pid} style={{ textAlign: 'center' }}>
                <Image src={getCardImage(card)!} alt="Karta" width={100} height={145} />
                <p>{Number(pid) === userId ? myNick : opponentNick}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="chat">
        <div className="chat-box">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`chat-message ${msg.nick === 'SYSTEM' ? 'system' : ''}`}
            >
              {msg.nick !== 'SYSTEM' && <strong>{msg.nick}: </strong>}
              {msg.message}
            </div>
          ))}
        </div>

        <div className="chat-input-row">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Napisz wiadomość..."
            style={{ flex: 1 }}
          />
          <button onClick={sendMessage}>Wyślij</button>
        </div>
      </div>
    </main>
  );
}
