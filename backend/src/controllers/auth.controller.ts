import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ResponseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      return ResponseUtil.created(res, result, 'Đăng ký tài khoản thành công.');
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      return ResponseUtil.success(res, result, 'Đăng nhập thành công.');
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 401);
    }
  }

  public static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const profile = await AuthService.getProfile(userId);
      return ResponseUtil.success(res, profile);
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }
}
