'use client';

import { useEffect, useState } from 'react';

type Profile = {
  nick: string;
  email: string;
  wins: number;
  losses: number;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    // tymczasowe dane „na sucho”
    setProfile({
      nick: 'Player1',
      email: 'player1@example.com',
      wins: 3,
      losses: 1,
    });
  }, []);

  if (!profile) {
    return <p>Ładowanie...</p>;
  }

  return (
    <main>
      <h1>Profil gracza</h1>

      <p>Nick: {profile.nick}</p>
      <p>Email: {profile.email}</p>
      <p>Wygrane: {profile.wins}</p>
      <p>Przegrane: {profile.losses}</p>
    </main>
  );
}
