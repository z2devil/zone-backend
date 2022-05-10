import { UserDocument } from '../models/user.model';
import { Request, Response } from 'express';
import { result, silentHandle } from '../common';
import config from '../../../settings';
import { redisUtils } from '../../redis';
import { randomUtil } from '../../utils';
import emailer from '../../utils/email';
import USER_CRUD from '../service/user.service';

/**
 * 发送验证码
 */
export async function sendCodeHandler(req: Request, res: Response) {
    const email = req.query.email;
    // 验证码的key
    const codeKey = config.auth['code-prefix'] + email;
    // 自上次发送验证码后经过多长时间
    const passTime =
        config.auth['code-expire-time'] - (await redisUtils.getTTL(codeKey));
    // 如果已经发送验证码同时验证码在冷却时间内
    if (
        (await redisUtils.get(codeKey)) &&
        passTime < config.auth['code-cooling-time']
    ) {
        return result.error(
            res,
            null,
            `该邮箱以发送过验证码, 请${
                config.auth['code-cooling-time'] - passTime
            }秒后再试`
        );
    }
    // 验证码的value
    const codeValue = randomUtil.CAPTCHA();
    // redis中存入验证码
    await redisUtils.set(codeKey, codeValue, {
        EX: config.auth['code-expire-time'],
    });
    // 发送邮箱验证码
    emailer.send(
        email + '',
        '【验证码】z2devil个人博客',
        `您的验证码为：${codeValue}, ${
            config.auth['code-expire-time'] / 60
        }分钟内有效。`
    );
    return result(res, null);
}

/**
 * 登录
 */
export async function loginHandler(req: Request, res: Response) {
    const [e, users] = await silentHandle<Array<UserDocument>>(
        USER_CRUD.find,
        req.query
    );

    return e ? result.error(res, null, e.message) : result(res, users);
}
