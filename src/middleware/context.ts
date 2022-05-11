import { Request, Response, NextFunction } from 'express';
import config from '../../settings';
import { jwtUtil } from '../utils';
import { silentHandle } from '../api/common';
import { redisUtils } from '../redis';

/**
 *  上下文管理
 */
export default async (req: Request, res: Response, next: NextFunction) => {
    const context: any = {};
    type TokenType = string | undefined;
    // 从请求头获取token
    const token = req.headers[config.auth.header] as TokenType;
    // 校验token
    const [e, data] = await silentHandle<{ email: string }>(
        jwtUtil.verify,
        token
    );
    // 校验成功时
    if (!e) {
        const email = data?.email;
        // email存在时
        if (email) {
            const tokenKey = config.auth['token-prefix'] + email;
            const redisToken = await redisUtils.get(tokenKey);
            // 缓存匹配时
            if (redisToken && redisToken === token) {
                context['user-email'] = email;
                // 将上下文存入res.locals
                res.locals._context = context;
                // 获取缓存ttl
                const ttl = await redisUtils.getTTL(tokenKey);
                // ttl小于续期时间时，续期
                if (ttl > 0 && ttl < config.auth['token-detect-scope']) {
                    await redisUtils.setTTL(
                        tokenKey,
                        config.auth['token-expire-time']
                    );
                }
            }
        }
    }
    next();
};
