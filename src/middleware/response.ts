import { Request, Response, NextFunction } from 'express';
import config from '../constant/settings';

const allowedOrigins = new Set(config.corsOrigins);

/**
 * 响应头处理中间件
 */
const response = (req: Request, res: Response, next: NextFunction) => {
  const { origin } = req.headers;

  // 只对白名单来源回显 Allow-Origin
  res.vary('Origin');
  if (origin && allowedOrigins.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  // 允许头部字段
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  // 允许公开的头部字段
  res.header('Access-Control-Expose-Headers', 'Content-Disposition');
  // 允许的请求方式
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  // 不携带cookie
  res.header('Access-Control-Allow-Credentials', 'false');

  // 预检返回204
  if (req.method == 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
};

export default response;
