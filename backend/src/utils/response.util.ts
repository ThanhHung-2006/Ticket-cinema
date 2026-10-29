import { Response } from 'express';

export class ResponseUtil {
  public static success(res: Response, data: any, message = 'Thành công', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
    });
  }

  public static created(res: Response, data: any, message = 'Tạo mới thành công') {
    return this.success(res, data, message, 201);
  }

  public static error(res: Response, message = 'Đã có lỗi xảy ra', statusCode = 500, errors: any = null) {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors: errors || undefined,
    });
  }
}
