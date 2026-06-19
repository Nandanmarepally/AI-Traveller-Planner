# AI Travel Planner 🌍✈️

A full-stack AI-powered travel planning application built with Next.js 15, Express.js, MongoDB, and Google Gemini AI.

## Features

- 🤖 **AI Itinerary Generation** — Groq AI (Llama 3.3 70B) creates day-by-day travel plans
- 🌤️ **Weather-Aware Planning** — Checks real weather (Open-Meteo) and adapts activities accordingly
- ✏️ **Editable Itineraries** — Add/remove activities or regenerate any day with a custom prompt
- 💬 **Trip Chat Assistant** — Ask your AI assistant anything about your trip
- 💰 **Budget Estimation** — Breakdown across flights, accommodation, food and activities
- 🏨 **Hotel Recommendations** — AI-suggested hotels for your budget
- 🔐 **Secure Auth** — JWT + HTTP-only cookies, complete data isolation between users

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express.js + TypeScript |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + HTTP-Only Cookies |
| AI | Groq (llama-3.3-70b-versatile) |
| Weather | Open-Meteo (free, no key required) |

## Project Structure

```
AI Travel Planner/
├── backend/          # Express API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.ts
│   └── .env
│
└── frontend/         # Next.js app
    ├── app/
    ├── components/
    ├── hooks/
    ├── services/
    └── types/
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Groq API key from [Groq Console](https://console.groq.com/keys)

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy and fill in environment variables:
   ```bash
   copy .env.example .env
   ```
   Edit `.env`:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_long_random_secret
   GROQ_API_KEY=your_groq_api_key
   CLIENT_URL=http://localhost:3000
   PORT=5000
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Copy environment variables:
   ```bash
   copy .env.local.example .env.local
   ```
   (Default points to `http://localhost:5000` — change if backend runs elsewhere)

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get profile |

### Trips
| Method | Path | Description |
|---|---|---|
| POST | `/api/trips` | Create trip with AI itinerary |
| GET | `/api/trips` | List user's trips |
| GET | `/api/trips/:id` | Get trip |
| PUT | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Delete trip |
| POST | `/api/trips/:id/regenerate-day` | AI regenerate a day |
| POST | `/api/trips/:id/add-activity` | Add activity |
| DELETE | `/api/trips/:id/remove-activity` | Remove activity |
| POST | `/api/trips/:id/chat` | Trip chat assistant |

## Deployment

### Backend → Render
1. Push to GitHub
2. Create new Web Service on Render
3. Set environment variables in Render dashboard
4. Build command: `npm run build`
5. Start command: `npm start`

### Frontend → Vercel
1. Import GitHub repo on Vercel
2. Set `NEXT_PUBLIC_API_URL` to your Render backend URL
3. Deploy

### Database → MongoDB Atlas
1. Create free M0 cluster
2. Whitelist `0.0.0.0/0` (or specific IPs for production)
3. Create database user
4. Copy connection string to `MONGODB_URI`
