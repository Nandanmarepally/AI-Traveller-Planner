// Shared TypeScript types across the frontend

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface WeatherContext {
  condition: 'sunny' | 'rainy' | 'cloudy' | 'mixed' | 'unknown';
  temperature: number;
  description: string;
}

export interface Day {
  day: number;
  theme: string;
  activities: string[];
}

export interface BudgetEstimate {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Trip {
  _id: string;
  userId: string;
  destination: string;
  days: number;
  budgetType: 'Budget' | 'Medium' | 'Luxury';
  interests: string[];
  weatherContext: WeatherContext;
  itinerary: Day[];
  budgetEstimate: BudgetEstimate;
  hotels: string[];
  chatHistory: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  message: string;
}

export type BudgetType = 'Budget' | 'Medium' | 'Luxury';

export const INTERESTS = [
  'Food & Dining',
  'Adventure',
  'Culture & History',
  'Nature & Wildlife',
  'Shopping',
  'Art & Museums',
  'Nightlife',
  'Photography',
  'Architecture',
  'Beaches',
  'Hiking',
  'Local Experiences',
];

export const BUDGET_TYPES: BudgetType[] = ['Budget', 'Medium', 'Luxury'];
