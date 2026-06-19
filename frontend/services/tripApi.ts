import { Trip, ChatMessage } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const handleResponse = async <T>(res: Response): Promise<T> => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data as T;
};

export interface CreateTripPayload {
  destination: string;
  days: number;
  budgetType: 'Budget' | 'Medium' | 'Luxury';
  interests: string[];
}

export const tripApi = {
  createTrip: async (payload: CreateTripPayload): Promise<{ trip: Trip }> => {
    const res = await fetch(`${API_URL}/api/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return handleResponse<{ trip: Trip }>(res);
  },

  getTrips: async (): Promise<{ trips: Trip[] }> => {
    const res = await fetch(`${API_URL}/api/trips`, { credentials: 'include' });
    return handleResponse<{ trips: Trip[] }>(res);
  },

  getTripById: async (id: string): Promise<{ trip: Trip }> => {
    const res = await fetch(`${API_URL}/api/trips/${id}`, { credentials: 'include' });
    return handleResponse<{ trip: Trip }>(res);
  },

  deleteTrip: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/api/trips/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse<void>(res);
  },

  regenerateDay: async (
    tripId: string,
    day: number,
    prompt: string
  ): Promise<{ trip: Trip }> => {
    const res = await fetch(`${API_URL}/api/trips/${tripId}/regenerate-day`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ day, prompt }),
    });
    return handleResponse<{ trip: Trip }>(res);
  },

  addActivity: async (
    tripId: string,
    day: number,
    activity: string
  ): Promise<{ trip: Trip }> => {
    const res = await fetch(`${API_URL}/api/trips/${tripId}/add-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ day, activity }),
    });
    return handleResponse<{ trip: Trip }>(res);
  },

  removeActivity: async (
    tripId: string,
    day: number,
    activityIndex: number
  ): Promise<{ trip: Trip }> => {
    const res = await fetch(`${API_URL}/api/trips/${tripId}/remove-activity`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ day, activityIndex }),
    });
    return handleResponse<{ trip: Trip }>(res);
  },

  chat: async (
    tripId: string,
    message: string
  ): Promise<{ response: string; chatHistory: ChatMessage[] }> => {
    const res = await fetch(`${API_URL}/api/trips/${tripId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message }),
    });
    return handleResponse<{ response: string; chatHistory: ChatMessage[] }>(res);
  },
};
