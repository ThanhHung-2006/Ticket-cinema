import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ResponseUtil } from '../utils/response.util';

export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return ResponseUtil.error(res, 'Dữ liệu đầu vào không hợp lệ', 400, errorMessages);
      }
      return ResponseUtil.error(res, 'Lỗi kiểm tra dữ liệu', 400);
    }
  };
};
