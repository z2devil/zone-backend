import { Authority } from '../constants/authority';
import settings from '../../settings';

const jwt = require('jsonwebtoken');

export default {
    create: (payload: any, expires: string = settings.jwtExpiration) => {
        return jwt.sign(payload, settings.jwtPrivateKey, {
            expiresIn: expires,
        });
    },
    verify: (token?: string) => {
        let info;
        try {
            info = jwt.verify(token, settings.jwtPrivateKey);
        } catch (e: any) {
            throw new Error(`token 校验失败, 错误信息: ${e.message}`);
        }
        return info;
    },
};
