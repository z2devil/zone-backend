import { Request, Response, NextFunction } from 'express';
import config from '../constant/settings';
import { jwtUtil } from '../utils';
import { silentHandle } from '../api/common';
import { redisUtils } from '../redis';

/**
 *  上下文处理中间件
 */
const context = async (req: Request, res: Response, next: NextFunction) => {
  type TokenType = string | undefined;
  // 从请求头获取token
  const token = req.headers[config.auth.header] as TokenType;
  // 校验token
  const [e, data] = await silentHandle<{ email: string; id: string }>(
    jwtUtil.verify,
    token
  );
  // 校验成功时
  if (!e && data && data.id && data.email) {
    // email存在时
    const tokenKey = config.auth['token-prefix'] + data.email;
    const redisToken = await redisUtils.get(tokenKey);
    // 缓存匹配时
    if (redisToken && redisToken === token) {
      const context = {
        user: data,
      };
      // 将上下文存入res.locals
      res.locals._context = context;
      // 获取缓存ttl
      const ttl = await redisUtils.getTTL(tokenKey);
      // ttl小于续期时间时，续期
      if (ttl > 0 && ttl < config.auth['token-detect-scope']) {
        await redisUtils.setTTL(tokenKey, config.auth['token-expire-time']);
      }
    }
  }
  next();
};

export default context;
