"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trip_controller_1 = require("../controllers/trip.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All trip routes require authentication
router.use(auth_middleware_1.protect);
router.post('/', trip_controller_1.createTrip);
router.get('/', trip_controller_1.getTrips);
router.get('/:id', trip_controller_1.getTripById);
router.put('/:id', trip_controller_1.updateTrip);
router.delete('/:id', trip_controller_1.deleteTrip);
router.post('/:id/regenerate-day', trip_controller_1.regenerateTripDay);
router.post('/:id/add-activity', trip_controller_1.addActivity);
router.delete('/:id/remove-activity', trip_controller_1.removeActivity);
router.post('/:id/chat', trip_controller_1.tripChat);
exports.default = router;
