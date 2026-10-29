import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateJwt, requireRoles } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateJwt, requireRoles([Role.ADMIN]));

router.get('/revenue', AdminController.getRevenue);
router.get('/bookings', AdminController.getAllBookings);

export default router;
