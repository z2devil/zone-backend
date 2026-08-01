import * as Redis from 'redis';
import config from '../constant/settings';
import logger from '../utils/logger';

let client: Redis.RedisClientType | undefined;
let open = false;
let ready = false;

const getRedisClient = async () => {
  if (!client) {
    client = Redis.createClient({
      url: `redis://:${config.redis.password}@${config.redis.host}:${config.redis.port}`,
      database: config.redis.db,
    });
    client.on('error', e => {
      ready = false;
      logger.error(
        {
          event: 'redis_client_error',
          error_type: e.name,
          error_code: (e as Error & { code?: string }).code || '',
        },
        'Redis client error'
      );
    });
    client.on('connect', () => {
      open = true;
    });
    client.on('ready', () => {
      ready = true;
    });
    client.on('reconnecting', () => {
      ready = false;
    });
    client.on('end', () => {
      open = false;
      ready = false;
    });
    await client.connect();
    open = true;
    ready = true;
    logger.info({ event: 'redis_connected' }, 'Redis connected');
  }
  return client;
};

export function isRedisReady() {
  return ready;
}

export async function disconnectRedis() {
  if (client && open) await client.quit();
  client = undefined;
  open = false;
  ready = false;
}

export default getRedisClient;
