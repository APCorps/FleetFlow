// Centralizes all communication between the React Native app and FleetFlow FastAPI backend.

// Uses the render url that the Android emulator can successfully reach.
const API_BASE_URL = 'https://fleetflowapi.onrender.com';

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

  /// Sends an uploaded document ID to the backend and logs the raw response for debugging.
async processDocument(documentId: string) {
  const response = await fetch(
    `${API_BASE_URL}/documents/process?document_id=${encodeURIComponent(documentId)}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    },
  );

  // Read the raw response first so we can see what the backend actually returned.
  const rawResponse = await response.text();

  console.log(
    'Document process HTTP status:',
    response.status,
  );

  console.log(
    'Document process raw response:',
    rawResponse,
  );

  let data;

  try {
    data = JSON.parse(rawResponse);
  } catch {
    throw new Error(
      `Backend returned a non-JSON response (${response.status}).`,
    );
  }

  if (!response.ok) {
    throw new Error(
      data.detail || 'Document processing failed.',
    );
  }

  return data;
},

};