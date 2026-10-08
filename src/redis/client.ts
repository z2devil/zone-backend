import * as Redis from 'redis';
import config from '../constant/settings';
import logger from '../utils/logger';

// 请求路径上等待 Redis 连接的最长时间
const CONNECT_TIMEOUT_MS = 2000;

let client: Redis.RedisClientType | undefined;
let connecting: Promise<void> | undefined;
let ready = false;

const createClient = () => {
  const instance: Redis.RedisClientType = Redis.createClient({
    url: `redis://:${config.redis.password}@${config.redis.host}:${config.redis.port}`,
    database: config.redis.db,
    // 断线期间命令立即失败，而不是排队等待重连拖住请求
    disableOfflineQueue: true,
    socket: { connectTimeout: CONNECT_TIMEOUT_MS },
  });
  instance.on('error', e => {
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
  instance.on('ready', () => {
    ready = true;
  });
  instance.on('reconnecting', () => {
    ready = false;
  });
  instance.on('end', () => {
    ready = false;
  });
  return instance;
};

const withTimeout = (promise: Promise<void>, ms: number) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('Redis connection timeout')),
      ms
    );
    promise.then(
      () => {
        clearTimeout(timer);
        resolve();
      },
      error => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });

const ensureConnecting = () => {
  if (!client) {
    const instance = createClient();
    client = instance;
    connecting = instance.connect().then(() => {
      // 连接过程中被主动关闭时 connect 也会结束，不能当作连接成功
      if (client !== instance || !instance.isReady) {
        throw new Error('Redis connection closed');
      }
      ready = true;
      logger.info({ event: 'redis_connected' }, 'Redis connected');
    });
    // 失败由 error 事件记录，这里避免未处理的拒绝
    connecting.catch(() => undefined);
  }
  return { instance: client, pending: connecting as Promise<void> };
};

/**
 * 启动时连接 Redis，等待首次连接成功
 */
export async function connectRedis() {
  const { pending } = ensureConnecting();
  await pending;
}

/**
 * 请求路径上获取 Redis 客户端：首次连接未完成时最多等待 CONNECT_TIMEOUT_MS，
 * 已连接后断线则直接返回，命令会因离线队列关闭而立即失败
 */
const getRedisClient = async () => {
  const { instance, pending } = ensureConnecting();
  await withTimeout(pending, CONNECT_TIMEOUT_MS);
  return instance;
};

export function isRedisReady() {
  return ready;
}

export async function disconnectRedis() {
  const instance = client;
  client = undefined;
  connecting = undefined;
  ready = false;
  if (!instance?.isOpen) return;
  try {
    if (instance.isReady) await instance.quit();
    else await instance.disconnect();
  } catch {
    // 关闭失败不影响退出
  }
}

export default getRedisClient;
