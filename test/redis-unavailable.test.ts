import assert from 'assert';
import getRedisClient, { disconnectRedis } from '../src/redis/client';

/**
 * Redis 不可用时（测试环境解析不到 redis 主机），请求路径上的取客户端操作
 * 必须在有限时间内失败，而不是无限挂起拖住请求。
 */
async function run() {
  const startedAt = Date.now();
  await assert.rejects(getRedisClient());
  const elapsed = Date.now() - startedAt;
  assert.ok(elapsed < 5000, `getRedisClient 耗时 ${elapsed}ms`);

  // 再次获取同样快速失败，不会复用挂起的连接
  await assert.rejects(getRedisClient());

  // 关闭时不挂起，进程可以正常退出
  await disconnectRedis();
}

run()
  .then(() => console.log('redis unavailable: passed'))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
