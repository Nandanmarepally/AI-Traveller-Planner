"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithTrip = exports.regenerateDay = exports.generateTripItinerary = void 0;
const weather_service_1 = require("./weather.service");
// ─── OpenRouter config ────────────────────────────────────────────────────────
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const getOpenRouterConfig = () => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey)
        throw new Error('OPENROUTER_API_KEY is not configured in .env');
    const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
    return { apiKey, model };
};
// ─── JSON parser (strips markdown fences if present) ─────────────────────────
const parseAIJson = (raw) => {
    const cleaned = raw
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
    try {
        return JSON.parse(cleaned);
    }
    catch {
        // Try to extract first JSON object/array from the text
        const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (match)
            return JSON.parse(match[0]);
        throw new Error(`AI returned non-JSON response: ${cleaned.slice(0, 200)}`);
    }
};
const complete = async (messages, maxTokens = 4096) => {
    const { apiKey, model } = getOpenRouterConfig();
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
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error ${response.status}: ${errorText.slice(0, 200)}`);
    }
    const data = await response.json();
    return data.choices[0]?.message?.content ?? '';
};
// ─── Prompts ──────────────────────────────────────────────────────────────────
const buildTripSystemPrompt = () => `You are an expert travel planner. You ALWAYS respond with valid JSON only — no markdown, no explanation, no extra text. Never wrap your response in code blocks.`;
const buildTripUserPrompt = (destination, days, budgetType, interests, weather) => {
    const weatherContext = (0, weather_service_1.buildWeatherContext)(weather);
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
const buildRegenerateDayUserPrompt = (destination, day, days, budgetType, interests, customPrompt) => `Regenerate Day ${day} of a ${days}-day trip to ${destination}.

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
const generateTripItinerary = async (destination, days, budgetType, interests, weather) => {
    const raw = await complete([
        { role: 'system', content: buildTripSystemPrompt() },
        { role: 'user', content: buildTripUserPrompt(destination, days, budgetType, interests, weather) },
    ]);
    const parsed = parseAIJson(raw);
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
exports.generateTripItinerary = generateTripItinerary;
/**
 * Regenerate a single day with a custom prompt.
 */
const regenerateDay = async (destination, day, days, budgetType, interests, customPrompt) => {
    const raw = await complete([
        { role: 'system', content: buildTripSystemPrompt() },
        { role: 'user', content: buildRegenerateDayUserPrompt(destination, day, days, budgetType, interests, customPrompt) },
    ], 1024);
    const parsed = parseAIJson(raw);
    if (!parsed.day || !Array.isArray(parsed.activities)) {
        throw new Error('AI returned an invalid day structure');
    }
    return parsed;
};
exports.regenerateDay = regenerateDay;
/**
 * Trip chat assistant — answers questions in the context of the current trip.
 */
const chatWithTrip = async (destination, days, budgetType, interests, itinerary, budgetEstimate, hotels, userMessage, previousMessages) => {
    const systemPrompt = `You are a knowledgeable and friendly travel assistant for a trip to ${destination}.

Trip context:
- Duration: ${days} days | Budget: ${budgetType}
- Interests: ${interests.join(', ')}
- Hotels: ${hotels.join(', ')}
- Budget: Flights $${budgetEstimate.flights}, Accommodation $${budgetEstimate.accommodation}, Food $${budgetEstimate.food}, Activities $${budgetEstimate.activities}, Total $${budgetEstimate.total}
- Itinerary: ${itinerary.map((d) => `Day ${d.day} (${d.theme}): ${d.activities.join(', ')}`).join(' | ')}

Answer helpfully and concisely. For budget questions, suggest specific adjustments. For restaurant/activity questions, give specific recommendations.`;
    // Build conversation history for OpenRouter
    const messages = [
        { role: 'system', content: systemPrompt },
        ...previousMessages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
        })),
        { role: 'user', content: userMessage },
    ];
    const response = await complete(messages, 1024);
    return response || 'Sorry, I could not generate a response.';
};
exports.chatWithTrip = chatWithTrip;
