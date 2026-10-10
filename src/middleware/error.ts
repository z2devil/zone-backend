import { Request, Response, NextFunction, RequestHandler } from 'express';
import { result } from '../api/common';
import { getRequestLogger } from '../observability/request';
import {
  RESPONSE_CODE_MAP,
  RESPONSE_MESSAGE_MAP,
  ResponseType,
} from '../constant/code';

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
 * 未匹配任何路由：返回 404 envelope，而不是 Express 默认的 HTML
 */
export function notFoundHandler(_req: Request, res: Response) {
  return result(res, null, {
    code: RESPONSE_CODE_MAP[ResponseType.NOT_FOUND],
    message: RESPONSE_MESSAGE_MAP[ResponseType.NOT_FOUND],
  });
}

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

  // body-parser 抛出的请求体错误属于客户端错误
  const type = (error as { type?: string } | null)?.type;
  if (type === 'entity.too.large') {
    return result(res, null, {
      code: RESPONSE_CODE_MAP[ResponseType.PAYLOAD_TOO_LARGE],
      message: RESPONSE_MESSAGE_MAP[ResponseType.PAYLOAD_TOO_LARGE],
    });
  }
  if (type === 'entity.parse.failed') {
    return result(res, null, {
      code: RESPONSE_CODE_MAP[ResponseType.ERROR],
      message: '请求体不是合法的 JSON',
    });
  }

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
