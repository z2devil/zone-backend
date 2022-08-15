import config from '../constant/settings';

import jwt, { JwtPayload } from 'jsonwebtoken';

export default {
  create: (payload: object) => {
    return jwt.sign(payload, config.auth['token-secret']);
  },
  verify: (token: string) => {
    let info: string | JwtPayload;
    try {
      info = jwt.verify(token, config.auth['token-secret']);
    } catch (e: any) {
      throw new Error(`token 校验失败, 错误信息: ${e.message}`);
    }
    return info;
  },
};
