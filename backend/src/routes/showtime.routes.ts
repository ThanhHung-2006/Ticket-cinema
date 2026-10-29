import { Router } from 'express';
import { ShowtimeController } from '../controllers/showtime.controller';
import { authenticateJwt, requireRoles } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createShowtimeSchema } from '../validators/showtime.validator';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', ShowtimeController.getShowtimes);
router.get('/:id', ShowtimeController.getShowtimeById);
router.get('/:id/seats', ShowtimeController.getShowtimeSeatMap);

router.post(
  '/',
  authenticateJwt,
  requireRoles([Role.ADMIN]),
  validateBody(createShowtimeSchema),
  ShowtimeController.createShowtime
);

router.delete(
  '/:id',
  authenticateJwt,
  requireRoles([Role.ADMIN]),
  ShowtimeController.deleteShowtime
);

export default router;
