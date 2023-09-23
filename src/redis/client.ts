import * as Redis from 'redis';
import config from '../constant/settings';

let client: Redis.RedisClientType;

const getRedisClient = async () => {
  if (!client) {
    client = Redis.createClient({
      url: `redis://:${config.redis.password}@${config.redis.host}:${config.redis.port}`,
      database: config.redis.db,
    });
    client.on('error', e => {
      throw new Error(e);
    });
    await client.connect();
  }
  return client;
};

export default getRedisClient;
