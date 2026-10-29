import { Router } from 'express';
import { CinemaController } from '../controllers/cinema.controller';
import { authenticateJwt, requireRoles } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createCinemaSchema, createRoomSchema } from '../validators/cinema.validator';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', CinemaController.getCinemas);
router.get('/:id', CinemaController.getCinemaById);

router.post(
  '/',
  authenticateJwt,
  requireRoles([Role.ADMIN]),
  validateBody(createCinemaSchema),
  CinemaController.createCinema
);

router.post(
  '/rooms',
  authenticateJwt,
  requireRoles([Role.ADMIN]),
  validateBody(createRoomSchema),
  CinemaController.createRoom
);

router.get('/rooms/:roomId/seats', CinemaController.getRoomSeats);

export default router;
