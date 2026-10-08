import { Request, Response, NextFunction } from 'express';
import { result } from '../api/common';
import getRedisClient from '../redis/client';
import { RESPONSE_CODE_MAP, ResponseType } from '../constant/code';
import { getRequestLogger } from '../observability/request';

interface RateLimitOptions {
  // 计数器名称，用于区分不同限流规则
  name: string;
  // 固定窗口时长，单位秒
  windowSeconds: number;
  // 窗口内允许的最大请求数
  max: number;
  // 计数维度，返回空值时跳过限流
  key: (req: Request) => string | undefined;
}

/**
 * 创建基于 Redis 固定窗口计数的限流中间件
 */
export function createRateLimit(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = options.key(req);
    if (!id) return next();
    const key = `limit:${options.name}:${id}`;

    let count: number;
    try {
      const client = await getRedisClient();
      count = await client.incr(key);
      // 首次计数时设置过期，避免 key 永不过期
      if (count === 1) await client.expire(key, options.windowSeconds);
      // 兜底修复：若此前 expire 未执行成功，超限时补上过期时间
      if (count > options.max && (await client.ttl(key)) === -1) {
        await client.expire(key, options.windowSeconds);
      }
    } catch (error) {
      // Redis 不可用时放行，限流不应拖垮主流程
      getRequestLogger(res).warn(
        {
          event: 'rate_limit_unavailable',
          limit: options.name,
          error_type: error instanceof Error ? error.name : 'unknown',
        },
        'Rate limit skipped'
      );
      return next();
    }

    if (count > options.max) {
      getRequestLogger(res).warn(
        { event: 'rate_limited', limit: options.name },
        'Rate limited'
      );
      return result(res, null, {
        code: RESPONSE_CODE_MAP[ResponseType.TOO_MANY_REQUESTS],
        message: '请求过于频繁，请稍后再试',
      });
    }
    next();
  };
}

/**
 * 按客户端 IP 计数
 */
export const byIp = (req: Request) => req.ip;

/**
 * 按请求中的邮箱计数（query 或 body）
 */
export const byEmail = (req: Request) => {
  const email = req.body?.email ?? req.query.email;
  return typeof email === 'string' && email
    ? email.trim().toLowerCase()
    : undefined;
};

/**
 * 全局限流：每个 IP 10 秒内最多 100 次请求
 */
const limit = createRateLimit({
  name: 'global',
  windowSeconds: 10,
  max: 100,
  key: byIp,
});

export default limit;
