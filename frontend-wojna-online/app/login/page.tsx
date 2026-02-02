'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [blocked, setBlocked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      setBlocked(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginUser({ email, password });
      alert('Zalogowano');
      router.push('/profile');
    } catch (err: any) {
      alert(err.message || 'Błąd logowania');
    }
  };

  if (blocked) {
    return (
      <main>
        <h1>Jesteś już zalogowany</h1>
        <p>Nie możesz ponownie się zalogować bez wylogowania.</p>
        <button onClick={() => router.push('/profile')}>
          Przejdź do profilu
        </button>
      </main>
    );
  }

  return (
    <main>
      <h1>Logowanie</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          placeholder="Hasło"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button type="submit">Zaloguj</button>
      </form>
    </main>
  );
}
