import { Request, Response, NextFunction } from 'express';
import config from '../constant/settings';
import { result } from '../api/common';
import { resolveSession } from '../api/service/auth.session';
import { maskIdentifier } from '../observability/logger';
import { getRequestLogger } from '../observability/request';

/**
 *  上下文处理中间件
 */
const context = async (req: Request, res: Response, next: NextFunction) => {
  // 从请求头获取token（与前端约定：Authorization 直接携带 token，无 Bearer 前缀）
  const header = req.headers[config.auth.header];
  const token = Array.isArray(header) ? header[0] : header;
  if (!token) {
    return next();
  }
  try {
    const session = await resolveSession(token);
    // 校验失败时按未登录处理
    if (session) {
      // 将上下文存入res.locals
      res.locals._context = {
        user: session.user,
        sid: session.sid,
        token,
      };
      res.locals._logger = getRequestLogger(res).child({
        user_hash: maskIdentifier(session.user.id),
      });
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
