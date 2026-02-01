'use client';

import { useRouter } from 'next/navigation';
import { createGame } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  const handleCreate = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Zaloguj się');

    const game = await createGame(token);
    router.push(`/game/${game.id}`);
  };

  return (
    <main>
      <h1>Wojna Online</h1>
      <button onClick={handleCreate}>Utwórz grę</button>
    </main>
  );
}
