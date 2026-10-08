import { Request, Response, NextFunction } from 'express';
import config from '../constant/settings';
import { jwtUtil } from '../utils';
import { result, silentHandle } from '../api/common';
import { redisUtils } from '../redis';
import { maskIdentifier } from '../observability/logger';
import { getRequestLogger } from '../observability/request';

/**
 *  上下文处理中间件
 */
const context = async (req: Request, res: Response, next: NextFunction) => {
  // 从请求头获取token
  const token = req.headers[config.auth.header];
  if (!token) {
    return next();
  }
  // 校验token
  const [e, data] = await silentHandle(
    jwtUtil.verify,
    Array.isArray(token) ? token[0] : token
  );
  // 校验失败时按未登录处理
  if (e || !data || typeof data === 'string' || !data.id || !data.email) {
    return next();
  }
  try {
    const tokenKey = config.auth['token-prefix'] + data.email;
    const redisToken = await redisUtils.get(tokenKey);
    // 缓存匹配时
    if (redisToken && redisToken === token) {
      const context = {
        user: data,
      };
      // 将上下文存入res.locals
      res.locals._context = context;
      res.locals._logger = getRequestLogger(res).child({
        user_hash: maskIdentifier(data.id),
      });
      // 获取缓存ttl
      const ttl = await redisUtils.getTTL(tokenKey);
      // ttl小于续期时间时，续期
      if (ttl > 0 && ttl < config.auth['token-detect-scope']) {
        await redisUtils.setTTL(tokenKey, config.auth['token-expire-time']);
      }
    }
  } catch (error) {
    // 会话存储不可用时无法判断登录态：返回 500，避免前端误判为登录失效
    getRequestLogger(res).error(
      {
        event: 'session_lookup_failed',
        error_type: error instanceof Error ? error.name : 'unknown',
      },
      'Session lookup failed'
    );
    return result.serverError(res, null);
  }
  next();
};

export default context;
