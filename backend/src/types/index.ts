import { Role } from '@prisma/client';
import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  fullName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
