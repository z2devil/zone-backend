import { Request, Response, NextFunction } from 'express';
import { result } from '../api/common';
import getRedisClient from '../redis/client';
import { RESPONSE_CODE_MAP, ResponseType } from '../constant/code';

// 窗口时间 5s
const PERIOD = 5;
// 限制次数 20次
const LIMIT_COUNT = 20;
// redis key 前缀
const PREFIX = 'limit:';

/**
 * 限流中间件
 */
const limit = async (req: Request, res: Response, next: NextFunction) => {
  const client = await getRedisClient();
  const ip = req.ip;
  const key = PREFIX + ip;
  const count = await client.incr(key);
  const isOverLimit = count > LIMIT_COUNT;
  // 是否超过限制次数
  if (isOverLimit) {
    return result(res, null, {
      code: RESPONSE_CODE_MAP[ResponseType.TOO_MANY_REQUESTS],
      message: '请求过于频繁，请稍后再试',
    });
  } else {
    client.expire(key, PERIOD);
  }
  next();
};

export default limit;
