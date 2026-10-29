import { Router } from 'express';
import { MovieController } from '../controllers/movie.controller';
import { authenticateJwt, requireRoles } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createMovieSchema, updateMovieSchema } from '../validators/movie.validator';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', MovieController.getMovies);
router.get('/:id', MovieController.getMovieById);

router.post(
  '/',
  authenticateJwt,
  requireRoles([Role.ADMIN]),
  validateBody(createMovieSchema),
  MovieController.createMovie
);

router.put(
  '/:id',
  authenticateJwt,
  requireRoles([Role.ADMIN]),
  validateBody(updateMovieSchema),
  MovieController.updateMovie
);

router.delete(
  '/:id',
  authenticateJwt,
  requireRoles([Role.ADMIN]),
  MovieController.deleteMovie
);

export default router;
