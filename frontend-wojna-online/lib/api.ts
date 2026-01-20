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

  return response.json();
}

export async function getProfile() {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Nie udało się pobrać profilu');
  }

  return response.json();
}
