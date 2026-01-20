'use client';

import { useState } from 'react';
import { registerUser } from '@/lib/api';

export default function RegisterPage() {
  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await registerUser({ nick, email, password });
      alert('Rejestracja udana');
    } catch (err) {
      alert('Błąd rejestracji');
    }
  };

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
