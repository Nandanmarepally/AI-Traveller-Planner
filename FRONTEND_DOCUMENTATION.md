# Frontend Architecture & Documentation

This document provides a comprehensive overview of the AI Travel Planner frontend, detailing its structure, state management, and key components.

## 1. Tech Stack & Framework

The frontend is a modern web application built using:
- **Next.js 15**: Utilizing the **App Router** (`app/` directory) for routing, layouts, and server/client component paradigms.
- **React**: For UI components and hooks (`useState`, `useContext`, `useEffect`).
- **TypeScript**: Ensuring end-to-end type safety alongside the backend.
- **Tailwind CSS**: Utility-first CSS framework for rapid, responsive styling.

---

## 2. Full Planning Structure

The frontend is organized cleanly by separation of concerns.

### Directory Tree (`frontend/`)
```
frontend/
├── app/              # Next.js App Router (Pages, Layouts, Routing)
│   ├── dashboard/    # User dashboard showing all generated trips
│   ├── login/        # Authentication login page
│   ├── register/     # Authentication registration page
│   ├── trips/        # Detailed trip view and editor (dynamic route [id])
│   ├── globals.css   # Global Tailwind styles
│   └── layout.tsx    # Root layout wrapping the entire app
├── components/       # Reusable React UI Components
│   ├── ChatAssistant.tsx  # Slide-out/fixed chat interface for trip queries
│   ├── DayCard.tsx        # UI card displaying a single day's itinerary
│   ├── Navbar.tsx         # Top navigation bar
│   └── TripCard.tsx       # Summary card for a trip shown on the dashboard
├── hooks/            # Custom React Hooks
│   └── useAuth.tsx        # AuthContext provider and hook for session state
├── services/         # API Client wrappers (Axios/Fetch)
│   ├── authApi.ts         # Login, Register, GetMe, Logout
│   └── tripApi.ts         # CRUD trips, Add/Remove activities, AI Regeneration
└── types/            # TypeScript Interfaces
    └── index.ts           # Interfaces mapping to Backend Models
```

---

## 3. State Management

The application keeps state management light and modular, avoiding heavy libraries like Redux in favor of React's built-in features.

### Authentication State (`useAuth.tsx`)
- Uses **React Context API** (`AuthContext`).
- The `AuthProvider` wraps the application (likely in `layout.tsx` or a dedicated provider wrapper).
- It maintains the global `user` object and `loading` state.
- Exposes `login`, `register`, and `logout` methods, keeping API calls out of the UI components.
- On initialization, it automatically fetches the user's session (`authApi.getMe()`) using HTTP-only cookies managed by the backend.

### Component-Level State
- Most state is handled locally within Next.js **Client Components** (marked with `"use client"`).
- For example, when a user views a specific trip, the `trips/[id]/page.tsx` component fetches the trip data and manages its local state (e.g., editing an activity, opening the chat assistant).

---

## 4. Key UI Components & Flows

### `ChatAssistant.tsx`
- **Purpose**: A context-aware chat interface allowing the user to converse with the Groq AI specifically about the trip they are viewing.
- **Interaction**: Captures user input, displays message history (`role: 'user' | 'assistant'`), and calls `tripApi.chatWithTrip(id, message)`.

### `DayCard.tsx`
- **Purpose**: Renders the itinerary for a specific day.
- **Interaction**: Displays the day number, the AI-generated `theme`, and the list of `activities`. It acts as the anchor for editing capabilities, where users can request the AI to "Regenerate this day" if they aren't satisfied with the initial output.

### `TripCard.tsx`
- **Purpose**: Provides a high-level summary of a generated trip.
- **Interaction**: Used primarily in the `dashboard/page.tsx` to display destinations, dates, and high-level details, acting as a clickable link to navigate to the detailed trip view.

---

## 5. Type Safety & API Integration

The frontend shares a highly symmetric type structure with the backend Mongoose models.

Located in `types/index.ts`, key interfaces include:
- `Trip`, `Day`, `BudgetEstimate`, `WeatherContext`, `ChatMessage`, `User`

### API Integration (`services/`)
API calls are abstracted away from components to keep them clean.
- The functions handle standard API interactions (GET, POST, PUT, DELETE).
- They rely on CORS and `credentials: true` to ensure HTTP-only cookies (holding the JWT) are passed securely to the backend on every request.
