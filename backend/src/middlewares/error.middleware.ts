import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.util';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';

  return ResponseUtil.error(res, message, statusCode, err.errors);
};
