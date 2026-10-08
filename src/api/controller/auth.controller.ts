import { Request, Response } from 'express';
import { result, throwHandle } from '../../api/common';
import config from '../../constant/settings';
import emailer from '../../utils/emailUtil';
import USER_CRUD from '../../api/service/user.service';
import { toAuthUserInfo } from './auth.presenter';
import { issueCode, revokeCode, verifyCode } from '../service/auth.code';
import { getRequestLogger } from '../../observability/request';
import { createSession, revokeSession } from '../service/auth.session';

/**
 * 发送验证码
 */
export async function sendCodeHandler(req: Request, res: Response) {
  const email = String(req.query.email);
  const issued = await issueCode(email);
  // 如果已经发送验证码同时验证码在冷却时间内
  if (!issued.ok) {
    return result.error(
      res,
      null,
      `该邮箱以发送过验证码, 请${issued.retryAfter}秒后再试`
    );
  }
  // 发送邮箱验证码
  try {
    await emailer.send(
      email,
      `【${issued.code}】z2devil个人博客的验证码`,
      `您的验证码为：${issued.code}, ${
        config.auth['code-expire-time'] / 60
      }分钟内有效。`
    );
  } catch (error) {
    getRequestLogger(res).error(
      {
        event: 'verification_mail_failed',
        error_type: error instanceof Error ? error.name : 'unknown',
      },
      'Verification mail failed'
    );
    // 发送失败时撤销验证码与冷却，允许用户立即重试
    await revokeCode(email).catch(() => undefined);
    return result.serverError(res, null);
  }
  return result(res, null);
}

/**
 * 登录或注册
 */
export async function signHandler(req: Request, res: Response) {
  // 获取请求参数
  const { email, code } = req.body;
  const verified = await verifyCode(email, code);
  if (verified.status === 'invalid') {
    return result.error(
      res,
      null,
      `验证码错误, 您还有${verified.remaining}次机会`
    );
  }
  if (verified.status === 'exhausted') {
    return result.error(res, null, '验证码失败次数过多, 请重新发送验证码');
  }
  if (verified.status === 'expired') {
    return result.error(res, null, '验证码过期或错误');
  }
  // 根据邮箱查询用户，如果用户不存在则注册用户
  let user = await throwHandle(USER_CRUD.findOne, { email });
  if (!user) {
    user = await throwHandle(USER_CRUD.create, {
      email,
    });
  }
  // 每次登录签发独立会话 token
  const token = await createSession({
    id: String(user._id),
    email: user.email,
  });
  // 异常交由全局错误处理返回通用文案
  return result(res, {
    info: toAuthUserInfo(user),
    token,
  });
}

/**
 * 获取用户信息
 */
export async function infoHandler(req: Request, res: Response) {
  // 从上下文获取当前用户信息
  const _user = res.locals._context?.user;
  // 根据email查询用户信息
  const user = await throwHandle(USER_CRUD.findOne, _user);
  if (!user) return result.error(res, null, '用户不存在');
  // 返回当前请求携带的会话 token
  return result(res, {
    info: toAuthUserInfo(user),
    token: res.locals._context?.token,
  });
}

/**
 * 退出登录：作废当前请求携带的 token
 */
export async function logoutHandler(req: Request, res: Response) {
  const sid = res.locals._context?.sid;
  if (!sid) return result.unauthorized(res, null);
  await revokeSession(sid);
  return result(res, null);
}
