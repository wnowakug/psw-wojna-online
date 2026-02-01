const API_URL = 'http://localhost:4000';

type RegisterData = {
  nick: string;
  email: string;
  password: string;
};

type LoginData = {
  email: string;
  password: string;
};


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

export async function loginUser(data: LoginData) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Logowanie nie powiodło się');
  }

  const result = await response.json();

  localStorage.setItem('token', result.token);

  return result;
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

export async function createGame(token: string) {
  const res = await fetch('http://localhost:4000/games', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Nie udało się utworzyć gry');
  return res.json();
}

export async function joinGame(gameId: string, token: string) {
  const res = await fetch(`http://localhost:4000/games/${gameId}/join`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Nie udało się dołączyć do gry');
  return res.json();
}
