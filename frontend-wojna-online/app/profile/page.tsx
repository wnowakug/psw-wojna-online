'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/lib/api';

type Profile = {
  nick: string;
  email: string;
  wins: number;
  losses: number;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

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
