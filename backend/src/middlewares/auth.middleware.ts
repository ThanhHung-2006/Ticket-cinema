import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthenticatedRequest, JwtPayload } from '../types';
import { Role } from '@prisma/client';
import { ResponseUtil } from '../utils/response.util';

export const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ResponseUtil.error(res, 'Yêu cầu đăng nhập. Thiếu Bearer Token.', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
    return next();
  } catch {
    return ResponseUtil.error(res, 'Token xác thực không hợp lệ hoặc đã hết hạn.', 401);
  }
};

export const optionalAuthenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = undefined;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
  } catch {
    req.user = undefined;
  }
  return next();
};

export const requireRoles = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseUtil.error(res, 'Chưa xác thực danh tính.', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return ResponseUtil.error(res, `Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: ${allowedRoles.join(', ')}`, 403);
    }
    return next();
  };
};
