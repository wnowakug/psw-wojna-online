'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginUser({ email, password });
      router.push('/profile');
    } catch {
      alert('Błąd logowania');
    }
  };

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
