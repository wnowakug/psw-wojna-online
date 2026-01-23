const API_URL = 'http://localhost:4000';

export async function registerUser(data: {
  nick: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Błąd rejestracji');
  return res.json();
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Błąd logowania');

  const result = await res.json();
  localStorage.setItem('token', result.token);
}

export async function getProfile() {
  const token = localStorage.getItem('token');

  if (!token) throw new Error('Brak tokena');

  const res = await fetch(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Brak dostępu');

  return res.json();
}
