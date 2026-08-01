import { Express, Request, Response } from 'express';

type DependencyStatus = 'up' | 'down';

export interface Readiness {
  ready: boolean;
  dependencies: {
    mongodb: DependencyStatus;
    redis: DependencyStatus;
  };
}

interface HealthDependencies {
  isMongoReady: () => boolean;
  isRedisReady: () => boolean;
}

export function getReadiness(
  mongoReady: boolean,
  redisReady: boolean
): Readiness {
  return {
    ready: mongoReady && redisReady,
    dependencies: {
      mongodb: mongoReady ? 'up' : 'down',
      redis: redisReady ? 'up' : 'down',
    },
  };
}

export function registerHealthRoutes(
  app: Express,
  dependencies: HealthDependencies
) {
  const service = 'zone-backend';
  const version = process.env.APP_VERSION || 'dev';

  app.get('/health/live', (_req: Request, res: Response) => {
    res.status(200).send({ status: 'ok', service, version });
  });

  app.get('/health/ready', (_req: Request, res: Response) => {
    const readiness = getReadiness(
      dependencies.isMongoReady(),
      dependencies.isRedisReady()
    );
    res
      .status(readiness.ready ? 200 : 503)
      .send({ ...readiness, service, version });
  });
}
