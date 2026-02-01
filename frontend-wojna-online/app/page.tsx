'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGame } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [gameIdInput, setGameIdInput] = useState('');

  const handleCreateGame = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Musisz być zalogowany');

    try {
      const game = await createGame(token);
      router.push(`/game/${game.id}`);
    } catch {
      alert('Nie udało się utworzyć gry');
    }
  };

  const handleJoinById = () => {
    if (!gameIdInput) return;
    router.push(`/game/${gameIdInput}`);
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Wojna Online</h1>

      <button onClick={handleCreateGame}>Utwórz grę</button>

      <hr style={{ margin: '20px 0' }} />

      <h3>Dołącz do gry po ID</h3>
      <input
        value={gameIdInput}
        onChange={e => setGameIdInput(e.target.value)}
        placeholder="Wpisz ID gry"
      />
      <button onClick={handleJoinById}>Dołącz</button>
    </main>
  );
}
