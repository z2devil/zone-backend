import express, { Express } from 'express';
import { Server } from 'http';
import config from './constant/settings';
import routes from './routes';
import { logger } from './utils';
import middleware from './middleware';
import { connectDB } from './api/common';
import { disconnectDB, isMongoReady } from './api/common/connectDB';
import getRedisClient, { disconnectRedis, isRedisReady } from './redis/client';
import { registerHealthRoutes } from './observability/health';
import { startSchedules, stopSchedules } from './schedule';

const SHUTDOWN_TIMEOUT_MS = 10_000;

export function createApp(): Express {
  const app = express();
  middleware.init(app);
  registerHealthRoutes(app, { isMongoReady, isRedisReady });
  routes(app);
  return app;
}

async function connectDependencies() {
  await Promise.all([connectDB(), getRedisClient()]);
}

async function disconnectDependencies() {
  await Promise.all([disconnectDB(), disconnectRedis()]);
}

function listen(app: Express): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = app.listen(config.port);
    server.once('listening', () => resolve(server));
    server.once('error', reject);
  });
}

function close(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close(error => (error ? reject(error) : resolve()));
  });
}

function registerGracefulShutdown(server: Server) {
  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    stopSchedules();

    logger.info(
      { event: 'service_shutdown_started', signal },
      'Service shutdown started'
    );

    const timeout = setTimeout(() => {
      logger.fatal(
        { event: 'service_shutdown_timed_out' },
        'Service shutdown timed out'
      );
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    timeout.unref();

    try {
      await close(server);
      await disconnectDependencies();
      clearTimeout(timeout);
      logger.info(
        { event: 'service_shutdown_finished' },
        'Service shutdown finished'
      );
    } catch (error) {
      clearTimeout(timeout);
      logger.error(
        {
          event: 'service_shutdown_failed',
          error_type: error instanceof Error ? error.name : 'unknown',
        },
        'Service shutdown failed'
      );
      process.exitCode = 1;
    }
  };

  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));
}

export async function startApp(): Promise<Server> {
  await connectDependencies();
  const server = await listen(createApp());
  startSchedules();
  registerGracefulShutdown(server);

  logger.info(
    { event: 'service_started', port: config.port },
    'Zone backend started'
  );
  return server;
}

if (require.main === module) {
  startApp().catch(async error => {
    logger.fatal(
      {
        event: 'service_start_failed',
        error_type: error instanceof Error ? error.name : 'unknown',
      },
      'Zone backend failed to start'
    );
    await disconnectDependencies().catch(() => undefined);
    process.exitCode = 1;
  });
}
