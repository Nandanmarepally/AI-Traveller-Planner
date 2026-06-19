import { Response } from 'express';
import Trip from '../models/Trip';
import { AuthRequest } from '../middleware/auth.middleware';
import { getDestinationWeather } from '../services/weather.service';
import { generateTripItinerary, regenerateDay, chatWithTrip } from '../services/ai.service';

// POST /api/trips — Create a new trip with AI-generated itinerary
export const createTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { destination, days, budgetType, interests } = req.body;

    if (!destination || !days || !budgetType) {
      res.status(400).json({ message: 'Destination, days, and budgetType are required' });
      return;
    }

    // Step 1: Fetch weather for weather-aware planning
    console.log(`🌤️  Fetching weather for ${destination}...`);
    const weather = await getDestinationWeather(destination);

    // Step 2: Generate AI itinerary
    console.log(`🤖 Generating AI itinerary for ${destination}...`);
    const aiResult = await generateTripItinerary(
      destination,
      Number(days),
      budgetType,
      interests || [],
      weather
    );

    // Step 3: Save trip to DB
    const trip = await Trip.create({
      userId,
      destination,
      days: Number(days),
      budgetType,
      interests: interests || [],
      weatherContext: weather,
      itinerary: aiResult.itinerary,
      budgetEstimate: aiResult.budgetEstimate,
      hotels: aiResult.hotels,
      chatHistory: [],
    });

    res.status(201).json({ message: 'Trip created successfully', trip });
  } catch (error: any) {
    console.error('Create trip error:', error);
    if (error.message?.includes('GEMINI_API_KEY')) {
      res.status(503).json({ message: 'AI service not configured. Please set GEMINI_API_KEY.' });
      return;
    }
    res.status(500).json({ message: 'Failed to create trip', error: error.message });
  }
};

// GET /api/trips — Get all trips for the authenticated user
export const getTrips = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trips = await Trip.find({ userId: req.user!._id })
      .select('-chatHistory')
      .sort({ createdAt: -1 });
    res.status(200).json({ trips });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ message: 'Failed to fetch trips' });
  }
};

// GET /api/trips/:id — Get a single trip (with ownership check)
export const getTripById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }
    if (trip.userId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    res.status(200).json({ trip });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ message: 'Failed to fetch trip' });
  }
};

// PUT /api/trips/:id — Update trip metadata
export const updateTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) { res.status(404).json({ message: 'Trip not found' }); return; }
    if (trip.userId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Access denied' }); return;
    }

    const allowed = ['destination', 'days', 'budgetType', 'interests'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) (trip as any)[field] = req.body[field];
    });

    await trip.save();
    res.status(200).json({ message: 'Trip updated', trip });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ message: 'Failed to update trip' });
  }
};

// DELETE /api/trips/:id — Delete a trip
export const deleteTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) { res.status(404).json({ message: 'Trip not found' }); return; }
    if (trip.userId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Access denied' }); return;
    }
    await trip.deleteOne();
    res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ message: 'Failed to delete trip' });
  }
};

// POST /api/trips/:id/regenerate-day — Regenerate a single day with AI
export const regenerateTripDay = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) { res.status(404).json({ message: 'Trip not found' }); return; }
    if (trip.userId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Access denied' }); return;
    }

    const { day, prompt } = req.body;
    if (!day || !prompt) {
      res.status(400).json({ message: 'day and prompt are required' }); return;
    }

    const newDay = await regenerateDay(
      trip.destination,
      Number(day),
      trip.days,
      trip.budgetType,
      trip.interests,
      prompt
    );

    // Replace the day in itinerary
    const dayIndex = trip.itinerary.findIndex((d) => d.day === Number(day));
    if (dayIndex === -1) {
      // Add as new day if doesn't exist
      trip.itinerary.push(newDay);
    } else {
      trip.itinerary[dayIndex] = newDay;
    }

    trip.markModified('itinerary');
    await trip.save();

    res.status(200).json({ message: `Day ${day} regenerated`, day: newDay, trip });
  } catch (error: any) {
    console.error('Regenerate day error:', error);
    res.status(500).json({ message: 'Failed to regenerate day', error: error.message });
  }
};

// POST /api/trips/:id/add-activity — Add an activity to a day
export const addActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) { res.status(404).json({ message: 'Trip not found' }); return; }
    if (trip.userId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Access denied' }); return;
    }

    const { day, activity } = req.body;
    if (!day || !activity) {
      res.status(400).json({ message: 'day and activity are required' }); return;
    }

    const dayEntry = trip.itinerary.find((d) => d.day === Number(day));
    if (!dayEntry) {
      res.status(404).json({ message: `Day ${day} not found in itinerary` }); return;
    }

    dayEntry.activities.push(activity);
    trip.markModified('itinerary');
    await trip.save();

    res.status(200).json({ message: 'Activity added', trip });
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({ message: 'Failed to add activity' });
  }
};

// DELETE /api/trips/:id/remove-activity — Remove an activity from a day
export const removeActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) { res.status(404).json({ message: 'Trip not found' }); return; }
    if (trip.userId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Access denied' }); return;
    }

    const { day, activityIndex } = req.body;
    if (day === undefined || activityIndex === undefined) {
      res.status(400).json({ message: 'day and activityIndex are required' }); return;
    }

    const dayEntry = trip.itinerary.find((d) => d.day === Number(day));
    if (!dayEntry) {
      res.status(404).json({ message: `Day ${day} not found in itinerary` }); return;
    }

    if (activityIndex < 0 || activityIndex >= dayEntry.activities.length) {
      res.status(400).json({ message: 'Invalid activity index' }); return;
    }

    dayEntry.activities.splice(Number(activityIndex), 1);
    trip.markModified('itinerary');
    await trip.save();

    res.status(200).json({ message: 'Activity removed', trip });
  } catch (error) {
    console.error('Remove activity error:', error);
    res.status(500).json({ message: 'Failed to remove activity' });
  }
};

// POST /api/trips/:id/chat — Trip chat assistant
export const tripChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) { res.status(404).json({ message: 'Trip not found' }); return; }
    if (trip.userId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Access denied' }); return;
    }

    const { message } = req.body;
    if (!message) {
      res.status(400).json({ message: 'message is required' }); return;
    }

    // Get recent chat history (last 10 messages for context)
    const recentHistory = trip.chatHistory.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const aiResponse = await chatWithTrip(
      trip.destination,
      trip.days,
      trip.budgetType,
      trip.interests,
      trip.itinerary,
      trip.budgetEstimate,
      trip.hotels,
      message,
      recentHistory
    );

    // Save both messages to chat history
    trip.chatHistory.push({ role: 'user', content: message, timestamp: new Date() });
    trip.chatHistory.push({ role: 'assistant', content: aiResponse, timestamp: new Date() });
    await trip.save();

    res.status(200).json({ response: aiResponse, chatHistory: trip.chatHistory });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Chat failed', error: error.message });
  }
};
