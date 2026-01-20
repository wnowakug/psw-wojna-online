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

type LoginResponse = {
  token: string;
};

export async function registerUser(data: RegisterData) {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Rejestracja nie powiodła się');
  }

  return response.json();
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

  const result: LoginResponse = await response.json();

  // 🔐 ZAPIS JWT
  localStorage.setItem('token', result.token);

  return result;
}

export async function getProfile() {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Brak tokena');
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Nie udało się pobrać profilu');
  }

  const data = await response.json();
  return data.user;
}
