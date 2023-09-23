import { Request, Response } from 'express';
import { result, throwHandle } from '../../api/common';
import config from '../../constant/settings';
import { redisUtils } from '../../redis';
import { jwtUtil, randomUtil } from '../../utils';
import emailer from '../../utils/emailUtil';
import USER_CRUD from '../../api/service/user.service';

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
  await redisUtils.set(
    codeKey,
    `${codeValue}-${config.auth['code-life-number']}`,
    {
      EX: config.auth['code-expire-time'],
    }
  );
  // 发送邮箱验证码
  emailer.send(
    String(email),
    `【${codeValue}】z2devil个人博客的验证码`,
    `您的验证码为：${codeValue}, ${
      config.auth['code-expire-time'] / 60
    }分钟内有效。`
  );
  return result(res, null);
}

/**
 * 登录或注册
 */
export async function signHandler(req: Request, res: Response) {
  let data: object;
  try {
    // 获取请求参数
    const { email, code } = req.body;
    // 验证码的key
    const codeKey = config.auth['code-prefix'] + email;
    // 缓存中的验证码
    const codeCache = await redisUtils.get(codeKey);
    // 如果缓存中没有找到记录，返回错误
    if (!codeCache) return result.error(res, null, '验证码过期或错误');
    // 获取验证码和机会次数
    const [codeValue, codeLife] = codeCache.split('-');
    let chance = Number.parseInt(codeLife);
    // 如果验证码和缓存记录不匹配
    if (code !== codeValue) {
      chance--;
      if (chance === 0) {
        await redisUtils.del(codeKey);
        return result.error(res, null, '验证码失败次数过多, 请重新发送验证码');
      } else {
        await redisUtils.set(codeKey, `${codeValue}-${chance}`);
        return result.error(res, null, `验证码错误, 您还有${chance}次机会`);
      }
    }
    // 删除验证码缓存
    await redisUtils.del(codeKey);
    // 根据邮箱查询用户，如果用户不存在则注册用户
    let user = await throwHandle(USER_CRUD.findOne, { email });
    if (!user) user = await throwHandle(USER_CRUD.create, { email });
    // 生成token
    const token = jwtUtil.create({ email, id: user._id });
    // 将token存入缓存
    await redisUtils.set(config.auth['token-prefix'] + email, token, {
      EX: config.auth['token-expire-time'],
    });
    // 获取用户部分属性
    const { lv, nickname, avatarPath } = user;
    // 对结果赋值
    data = {
      info: {
        email,
        lv,
        nickname,
        avatarPath,
      },
      token,
    };
  } catch (e: any) {
    return result.error(res, null, e.message);
  }
  return result(res, data);
}

/**
 * 获取用户信息
 */
export async function infoHandler(req: Request, res: Response) {
  let data: object;
  try {
    // 从上下文获取当前用户信息
    const _user = res.locals._context?.user;
    // 根据email查询用户信息
    const user = await throwHandle(USER_CRUD.findOne, _user);
    // 获取用户部分属性
    const { email, lv, nickname, avatarPath } = user;
    // 从缓存获取token
    const token = await redisUtils.get(config.auth['token-prefix'] + email);
    // 对结果赋值
    data = {
      info: {
        email,
        lv,
        nickname,
        avatarPath,
      },
      token,
    };
  } catch (e: any) {
    return result.error(res, null, e.message);
  }
  return result(res, data);
}
