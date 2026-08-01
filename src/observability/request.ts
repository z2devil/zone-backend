import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { Logger } from 'pino';
import logger from './logger';

export const REQUEST_ID_HEADER = 'X-Request-ID';
const SAFE_REQUEST_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;

export function resolveRequestId(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate && SAFE_REQUEST_ID.test(candidate)) return candidate;
  return `req_${randomBytes(12).toString('hex')}`;
}

export function getRequestLogger(res: Response): Logger {
  return res.locals._logger || logger;
}

export default function requestObservability(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = resolveRequestId(req.headers['x-request-id']);
  const requestLogger = logger.child({ request_id: requestId });
  const startedAt = process.hrtime();

  res.locals._requestId = requestId;
  res.locals._logger = requestLogger;
  res.setHeader(REQUEST_ID_HEADER, requestId);

  res.once('finish', () => {
    const elapsed = process.hrtime(startedAt);
    const durationMs =
      Math.round((elapsed[0] * 1e3 + elapsed[1] / 1e6) * 100) / 100;
    const level =
      res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    getRequestLogger(res)[level](
      {
        event: 'http_request_finished',
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration_ms: durationMs,
        success: res.statusCode < 400,
      },
      'HTTP request finished'
    );
  });

  next();
}
