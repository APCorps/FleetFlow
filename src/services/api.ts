// Centralizes all communication between the React Native app and FleetFlow FastAPI backend.

// Uses the Windows host IP that the Android emulator can successfully reach.
const API_BASE_URL = 'http://192.168.1.2:8000';

export const api = {

  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }

    return data;
  },

};