'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';

export default function RegisterPage() {
  const [nick, setNick] = useState('');
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
      await registerUser({ nick, email, password });
      alert('Rejestracja udana');
      router.push('/login');
    } catch (err: any) {
      alert(err.message || 'Błąd rejestracji');
    }
  };

  if (blocked) {
    return (
      <main>
        <h1>Jesteś już zalogowany</h1>
        <p>
          Jeżeli chcesz założyć nowe konto, najpierw się wyloguj.
        </p>
        <button onClick={() => router.push('/profile')}>
          Przejdź do profilu
        </button>
      </main>
    );
  }

  return (
    <main>
      <h1>Rejestracja</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Nick"
          value={nick}
          onChange={e => setNick(e.target.value)}
        />

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

        <button type="submit">Zarejestruj</button>
      </form>
    </main>
  );
}
