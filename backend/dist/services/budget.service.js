"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateBudget = void 0;
const BUDGET_MULTIPLIERS = {
    Budget: { flights: 0.6, accommodation: 0.5, food: 0.5, activities: 0.5 },
    Medium: { flights: 1.0, accommodation: 1.0, food: 1.0, activities: 1.0 },
    Luxury: { flights: 2.5, accommodation: 3.0, food: 2.0, activities: 2.0 },
};
// Base costs per day (Medium budget baseline, in USD)
const BASE_DAILY = {
    accommodation: 80,
    food: 50,
    activities: 40,
};
const BASE_FLIGHT = 400;
const estimateBudget = (days, budgetType) => {
    const multipliers = BUDGET_MULTIPLIERS[budgetType];
    const flights = Math.round(BASE_FLIGHT * multipliers.flights);
    const accommodation = Math.round(BASE_DAILY.accommodation * multipliers.accommodation * days);
    const food = Math.round(BASE_DAILY.food * multipliers.food * days);
    const activities = Math.round(BASE_DAILY.activities * multipliers.activities * days);
    const total = flights + accommodation + food + activities;
    return { flights, accommodation, food, activities, total };
};
exports.estimateBudget = estimateBudget;
