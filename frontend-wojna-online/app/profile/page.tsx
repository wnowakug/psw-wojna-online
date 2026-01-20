'use client';

import { useEffect, useState } from 'react';
import { getProfile } from '@/lib/api';

type Profile = {
  nick: string;
  email: string;
  wins: number;
  losses: number;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => alert('Brak dostępu'));
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
