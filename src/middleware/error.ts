import { Request, Response, NextFunction, RequestHandler } from 'express';
import { result } from '../api/common';
import { getRequestLogger } from '../observability/request';

/**
 * 包装异步中间件/处理器，把 rejected Promise 交给 Express 错误处理链
 */
export const asyncHandler =
  (
    handler: (req: Request, res: Response, next: NextFunction) => unknown
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve()
      .then(() => handler(req, res, next))
      .catch(next);
  };

/**
 * 全局错误处理：记录日志，对外只返回通用文案
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) return next(error);
  getRequestLogger(res).error(
    {
      event: 'request_unhandled_error',
      error_type: error instanceof Error ? error.name : 'unknown',
      error_message: error instanceof Error ? error.message : String(error),
    },
    'Unhandled request error'
  );
  return result.serverError(res, null);
}
