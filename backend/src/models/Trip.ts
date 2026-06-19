import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity {
  text: string;
}

export interface IDay {
  day: number;
  theme: string;
  activities: string[];
}

export interface IBudgetEstimate {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface IWeatherContext {
  condition: 'sunny' | 'rainy' | 'cloudy' | 'mixed' | 'unknown';
  temperature: number;
  description: string;
}

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ITrip extends Document {
  userId: mongoose.Types.ObjectId;
  destination: string;
  days: number;
  budgetType: 'Budget' | 'Medium' | 'Luxury';
  interests: string[];
  weatherContext: IWeatherContext;
  itinerary: IDay[];
  budgetEstimate: IBudgetEstimate;
  hotels: string[];
  chatHistory: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const daySchema = new Schema<IDay>({
  day: { type: Number, required: true },
  theme: { type: String, default: '' },
  activities: [{ type: String }],
});

const budgetEstimateSchema = new Schema<IBudgetEstimate>({
  flights: { type: Number, default: 0 },
  accommodation: { type: Number, default: 0 },
  food: { type: Number, default: 0 },
  activities: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});

const weatherContextSchema = new Schema<IWeatherContext>({
  condition: {
    type: String,
    enum: ['sunny', 'rainy', 'cloudy', 'mixed', 'unknown'],
    default: 'unknown',
  },
  temperature: { type: Number, default: 0 },
  description: { type: String, default: '' },
});

const chatMessageSchema = new Schema<IChatMessage>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const tripSchema = new Schema<ITrip>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    days: {
      type: Number,
      required: [true, 'Number of days is required'],
      min: [1, 'Trip must be at least 1 day'],
      max: [30, 'Trip cannot exceed 30 days'],
    },
    budgetType: {
      type: String,
      enum: ['Budget', 'Medium', 'Luxury'],
      required: [true, 'Budget type is required'],
    },
    interests: [{ type: String }],
    weatherContext: { type: weatherContextSchema, default: {} },
    itinerary: [daySchema],
    budgetEstimate: { type: budgetEstimateSchema, default: {} },
    hotels: [{ type: String }],
    chatHistory: [chatMessageSchema],
  },
  { timestamps: true }
);

export default mongoose.model<ITrip>('Trip', tripSchema);
