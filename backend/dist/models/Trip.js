"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const daySchema = new mongoose_1.Schema({
    day: { type: Number, required: true },
    theme: { type: String, default: '' },
    activities: [{ type: String }],
});
const budgetEstimateSchema = new mongoose_1.Schema({
    flights: { type: Number, default: 0 },
    accommodation: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    activities: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
});
const weatherContextSchema = new mongoose_1.Schema({
    condition: {
        type: String,
        enum: ['sunny', 'rainy', 'cloudy', 'mixed', 'unknown'],
        default: 'unknown',
    },
    temperature: { type: Number, default: 0 },
    description: { type: String, default: '' },
});
const chatMessageSchema = new mongoose_1.Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});
const tripSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, { timestamps: true });
exports.default = mongoose_1.default.model('Trip', tripSchema);
