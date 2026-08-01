import { createHash } from 'crypto';
import pino, { DestinationStream, Logger, LoggerOptions } from 'pino';

const REDACTED = '[REDACTED]';

const redactPaths = [
  'authorization',
  'token',
  'accessToken',
  'refreshToken',
  'password',
  'email',
  'verificationCode',
  'verifyCode',
  '*.authorization',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.password',
  '*.email',
  '*.verificationCode',
  '*.verifyCode',
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body',
  'request.headers.authorization',
  'request.headers.cookie',
  'request.body',
];

function loggerOptions(): LoggerOptions {
  return {
    level: process.env.LOG_LEVEL || 'info',
    base: {
      service: 'zone-backend',
      env: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || 'dev',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: redactPaths,
      censor: REDACTED,
    },
  };
}

export function createLogger(destination?: DestinationStream): Logger {
  const options = loggerOptions();
  if (destination) return pino(options, destination);

  if (process.env.NODE_ENV !== 'production') {
    return pino(
      options,
      pino.transport({
        target: 'pino-pretty',
        options: { colorize: true, singleLine: true },
      })
    );
  }

  return pino(options);
}

export function maskIdentifier(value: string): string {
  const normalized = value.trim();
  if (!normalized) return '';
  return `usr_${createHash('sha256')
    .update(normalized)
    .digest('hex')
    .slice(0, 12)}`;
}

const logger = createLogger();

export default logger;
