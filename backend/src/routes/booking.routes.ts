import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { confirmPaymentSchema, holdSeatsSchema } from '../validators/booking.validator';

const router = Router();

router.post('/hold', authenticateJwt, validateBody(holdSeatsSchema), BookingController.holdSeats);
router.post('/:bookingId/confirm', authenticateJwt, validateBody(confirmPaymentSchema), BookingController.confirmPayment);
router.post('/:bookingId/cancel', authenticateJwt, BookingController.cancelBooking);
router.get('/my', authenticateJwt, BookingController.getUserBookings);
router.get('/:bookingId', authenticateJwt, BookingController.getBookingById);

export default router;
