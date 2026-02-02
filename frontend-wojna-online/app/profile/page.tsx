'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';

type Profile = {
  nick: string;
  email: string;
  wins: number;
  losses: number;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login');
      return;
    }

    getProfile()
      .then(setProfile)
      .catch((err) => {
        console.error(err);
        setError('Nie udało się pobrać profilu.');
      })
      .finally(() => setCheckingAuth(false));
  }, [router]);

  if (checkingAuth) {
    return <p>Sprawdzanie sesji...</p>;
  }

  if (error) {
    return (
      <main>
        <h1>Błąd</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!profile) return null;

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
