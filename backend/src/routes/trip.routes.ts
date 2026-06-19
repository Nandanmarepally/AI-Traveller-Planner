import { Router } from 'express';
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  regenerateTripDay,
  addActivity,
  removeActivity,
  tripChat,
} from '../controllers/trip.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All trip routes require authentication
router.use(protect);

router.post('/', createTrip);
router.get('/', getTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

router.post('/:id/regenerate-day', regenerateTripDay);
router.post('/:id/add-activity', addActivity);
router.delete('/:id/remove-activity', removeActivity);
router.post('/:id/chat', tripChat);

export default router;
