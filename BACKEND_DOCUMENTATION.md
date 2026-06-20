# Backend Architecture & Documentation

This document provides a comprehensive overview of the AI Travel Planner backend, detailing its planning structure, MongoDB schemas, and the AI (LLM) implementation.

## 1. Full Planning Structure

The backend is built with **Node.js, Express.js, and TypeScript**, following a clear separation of concerns (Controller-Service-Model architecture).

### Directory Tree (`backend/src/`)
```
src/
├── config/           # Configuration files (e.g., db.ts for MongoDB connection)
├── controllers/      # Route handlers (processing requests & returning responses)
├── middleware/       # Express middlewares (Auth guards, error handling)
├── models/           # Mongoose schemas & interfaces
├── routes/           # Express router definitions
├── services/         # Core business logic and external API integrations
└── server.ts         # Application entry point & global middleware setup
```

### Core Flow
1. **Route** (`trip.routes.ts`) receives an HTTP request.
2. **Middleware** (`auth.middleware.ts`) verifies the JWT cookie and attaches the user to the request.
3. **Controller** (`trip.controller.ts`) parses the request body/params.
4. **Service** (`ai.service.ts`, `weather.service.ts`) executes complex logic like calling Groq or Open-Meteo.
5. **Model** (`Trip.ts`) saves the generated data to MongoDB.
6. **Controller** returns the formatted JSON response to the client.

---

## 2. MongoDB Schema Design

The database layer utilizes **Mongoose** to define strict schemas and TypeScript interfaces for full type safety.

### User Schema (`User.ts`)
Handles authentication and user identity.
- **name**: `String` (min 2 chars)
- **email**: `String` (unique, lowercase, validated with regex)
- **password**: `String` (min 6 chars, hashed via `bcryptjs` in a `pre-save` hook)
- **timestamps**: `createdAt`, `updatedAt`

### Trip Schema (`Trip.ts`)
Stores the complete state of a user's generated travel plan.
- **userId**: `ObjectId` (Refers to `User` model, indexed for fast lookups)
- **destination**: `String`
- **days**: `Number` (1 to 30 days)
- **budgetType**: `String` (Enum: `'Budget', 'Medium', 'Luxury'`)
- **interests**: `[String]` (e.g., ["museums", "food"])
- **weatherContext**: `Object` (Nested Schema)
  - `condition`: `'sunny' | 'rainy' | 'cloudy' | 'mixed' | 'unknown'`
  - `temperature`: `Number`
  - `description`: `String`
- **itinerary**: `[Object]` (Nested Schema for daily plans)
  - `day`: `Number`
  - `theme`: `String`
  - `activities`: `[String]`
- **budgetEstimate**: `Object` (Nested Schema)
  - `flights`, `accommodation`, `food`, `activities`, `total` (all `Number`)
- **hotels**: `[String]`
- **chatHistory**: `[Object]` (Nested Schema for trip-specific chat)
  - `role`: `'user' | 'assistant'`
  - `content`: `String`
  - `timestamp`: `Date`
- **timestamps**: `createdAt`, `updatedAt`

---

## 3. AI Model (LLM) Implementation

The application leverages **Groq SDK** to access high-performance open-source LLMs, specifically using **Llama 3.3 70B Versatile**. The logic is contained in `services/ai.service.ts`.

### Model Details
- **Provider**: Groq
- **Model**: `llama-3.3-70b-versatile`
- **Temperature**: `0.7` (Balances creativity with logical consistency)

### Core AI Capabilities

#### A. Full Itinerary Generation (`generateTripItinerary`)
- **Input**: Destination, days, budget, interests, and real-time weather context.
- **Prompt Strategy**: The System Prompt strictly enforces a JSON-only response without markdown wrapping. The User Prompt provides strict rules (e.g., exactly `X` days, 3-5 activities per day, USD budget estimates).
- **Parsing**: A custom `parseAIJson` utility cleans the LLM response by stripping any accidental markdown blocks (` ```json `) and extracting the core JSON structure.

#### B. Single Day Regeneration (`regenerateDay`)
- **Input**: Destination, specific day, budget, interests, and a user's *custom prompt* (e.g., "Make it more kid-friendly" or "Focus only on seafood").
- **Output**: Returns a single regenerated day object (`theme` and `activities`), allowing modular updates to the trip without regenerating the whole itinerary.

#### C. Trip Chat Assistant (`chatWithTrip`)
- **Input**: The entire trip context (itinerary, budget, hotels, interests) and the user's message.
- **Prompt Strategy**: The System Prompt injects the *current state* of the trip, effectively grounding the LLM in the user's specific itinerary.
- **Conversation History**: Previous messages are appended to the context window, allowing multi-turn conversations about the trip (e.g., "Where can I eat near activity 2 on day 1?").

---

## 4. Third-Party Integrations

- **Open-Meteo (`weather.service.ts`)**: Fetches 14-day forecasts. The weather data is summarized into a `WeatherContext` string and injected into the AI prompt so the LLM plans indoor activities on rainy days and outdoor activities on sunny days.
- **Groq API (`ai.service.ts`)**: Powers all LLM generations. Selected for its ultra-fast inference speed, which is critical for UX when generating large JSON itineraries.


