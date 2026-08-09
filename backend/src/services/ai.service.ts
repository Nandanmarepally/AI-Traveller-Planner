import { IDay, IBudgetEstimate } from '../models/Trip';
import { WeatherData, buildWeatherContext } from './weather.service';

export interface AITripResult {
  itinerary: IDay[];
  budgetEstimate: IBudgetEstimate;
  hotels: string[];
}

// ─── OpenRouter config ────────────────────────────────────────────────────────
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const getOpenRouterConfig = (): { apiKey: string; model: string } => {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured in .env');
  const model = process.env.OPENROUTER_MODEL?.trim() || 'openrouter/free';
  return { apiKey, model };
};

// ─── JSON parser (strips markdown fences if present) ─────────────────────────
const parseAIJson = <T>(raw: string): T => {
  const cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Try to extract first JSON object/array from the text
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error(`AI returned non-JSON response: ${cleaned.slice(0, 200)}`);
  }
};

// ─── Chat helper ──────────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const complete = async (
  messages: ChatMessage[],
  maxTokens: number = 4096
): Promise<string> => {
  const { apiKey, model } = getOpenRouterConfig();

  console.log(`🤖 Sending OpenRouter request — model: "${model}", key configured: ${!!apiKey}`);

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });

  console.log(`OpenRouter status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ OpenRouter error response body: ${errorText}`);
    throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string | null } }>;
  };

  return data.choices[0]?.message?.content ?? '';
};

// ─── Prompts ──────────────────────────────────────────────────────────────────
const buildTripSystemPrompt = (): string =>
  `You are an expert travel planner. You ALWAYS respond with valid JSON only — no markdown, no explanation, no extra text. Never wrap your response in code blocks.`;

const buildTripUserPrompt = (
  destination: string,
  days: number,
  budgetType: string,
  interests: string[],
  weather: WeatherData
): string => {
  const weatherContext = buildWeatherContext(weather);
  const interestsList = interests.length > 0 ? interests.join(', ') : 'general sightseeing';

  return `Create a detailed ${days}-day travel itinerary for ${destination}.

Trip Details:
- Destination: ${destination}
- Duration: ${days} days
- Budget: ${budgetType}
- Interests: ${interestsList}
${weatherContext ? `- Weather: ${weatherContext}` : ''}

Rules:
1. Exactly ${days} days with 3–5 activities each
2. Each day must have a "theme" field
3. Suggest 3–5 real hotels matching the ${budgetType} budget
4. Provide realistic USD budget estimates
5. Activities must be specific and real — no generic placeholders

Respond ONLY with this JSON (no markdown, no explanation):
{
  "itinerary": [
    { "day": 1, "theme": "Theme Name", "activities": ["Activity 1", "Activity 2", "Activity 3"] }
  ],
  "hotels": ["Hotel 1", "Hotel 2", "Hotel 3"],
  "budgetEstimate": {
    "flights": 0,
    "accommodation": 0,
    "food": 0,
    "activities": 0,
    "total": 0
  }
}`;
};

const buildRegenerateDayUserPrompt = (
  destination: string,
  day: number,
  days: number,
  budgetType: string,
  interests: string[],
  customPrompt: string
): string =>
  `Regenerate Day ${day} of a ${days}-day trip to ${destination}.

Details:
- Budget: ${budgetType}
- Interests: ${interests.join(', ')}
- Special request: ${customPrompt}

Rules:
- 3–5 specific, real activities
- Include a theme matching the special request

Respond ONLY with this JSON (no markdown, no explanation):
{
  "day": ${day},
  "theme": "Theme Name",
  "activities": ["Activity 1", "Activity 2", "Activity 3"]
}`;

// ─── Exported service functions ───────────────────────────────────────────────

/**
 * Generate a full AI-powered trip itinerary with weather context.
 */
export const generateTripItinerary = async (
  destination: string,
  days: number,
  budgetType: string,
  interests: string[],
  weather: WeatherData
): Promise<AITripResult> => {
  const raw = await complete([
    { role: 'system', content: buildTripSystemPrompt() },
    { role: 'user', content: buildTripUserPrompt(destination, days, budgetType, interests, weather) },
  ]);

  const parsed = parseAIJson<{
    itinerary: IDay[];
    hotels: string[];
    budgetEstimate: IBudgetEstimate;
  }>(raw);

  if (!Array.isArray(parsed.itinerary) || parsed.itinerary.length === 0) {
    throw new Error('AI returned an invalid or empty itinerary');
  }

  return {
    itinerary: parsed.itinerary,
    hotels: Array.isArray(parsed.hotels) ? parsed.hotels : [],
    budgetEstimate: parsed.budgetEstimate ?? {
      flights: 0,
      accommodation: 0,
      food: 0,
      activities: 0,
      total: 0,
    },
  };
};

/**
 * Regenerate a single day with a custom prompt.
 */
export const regenerateDay = async (
  destination: string,
  day: number,
  days: number,
  budgetType: string,
  interests: string[],
  customPrompt: string
): Promise<IDay> => {
  const raw = await complete([
    { role: 'system', content: buildTripSystemPrompt() },
    { role: 'user', content: buildRegenerateDayUserPrompt(destination, day, days, budgetType, interests, customPrompt) },
  ], 1024);

  const parsed = parseAIJson<IDay>(raw);

  if (!parsed.day || !Array.isArray(parsed.activities)) {
    throw new Error('AI returned an invalid day structure');
  }

  return parsed;
};

/**
 * Trip chat assistant — answers questions in the context of the current trip.
 */
export const chatWithTrip = async (
  destination: string,
  days: number,
  budgetType: string,
  interests: string[],
  itinerary: IDay[],
  budgetEstimate: IBudgetEstimate,
  hotels: string[],
  userMessage: string,
  previousMessages: { role: string; content: string }[]
): Promise<string> => {
  const systemPrompt = `You are a knowledgeable and friendly travel assistant for a trip to ${destination}.

Trip context:
- Duration: ${days} days | Budget: ${budgetType}
- Interests: ${interests.join(', ')}
- Hotels: ${hotels.join(', ')}
- Budget: Flights $${budgetEstimate.flights}, Accommodation $${budgetEstimate.accommodation}, Food $${budgetEstimate.food}, Activities $${budgetEstimate.activities}, Total $${budgetEstimate.total}
- Itinerary: ${itinerary.map((d) => `Day ${d.day} (${d.theme}): ${d.activities.join(', ')}`).join(' | ')}

Answer helpfully and concisely. For budget questions, suggest specific adjustments. For restaurant/activity questions, give specific recommendations.`;

  // Build conversation history for OpenRouter
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...previousMessages.map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const response = await complete(messages, 1024);
  return response || 'Sorry, I could not generate a response.';
};


