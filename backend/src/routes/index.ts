import { Router } from 'express';
import authRoutes from './auth.routes';
import movieRoutes from './movie.routes';
import cinemaRoutes from './cinema.routes';
import showtimeRoutes from './showtime.routes';
import bookingRoutes from './booking.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/cinemas', cinemaRoutes);
router.use('/showtimes', showtimeRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);

export default router;
