import { signSchema, sendCodeSchema } from './../api/schema/auth.schema';
import { Router } from 'express';
import validate from '../middleware/validate';
import {
  signHandler,
  sendCodeHandler,
  infoHandler,
} from '../api/controller/auth.controller';
import { Authority } from '../constant/authority';
import { byEmail, byIp, createRateLimit } from '../middleware/limit';

const router = Router();

// 发码：同一 IP 每小时 10 次（防止批量轰炸不同邮箱），同一邮箱每小时 5 次
const sendCodeIpLimit = createRateLimit({
  name: 'auth-code-ip',
  windowSeconds: 3600,
  max: 10,
  key: byIp,
});
const sendCodeEmailLimit = createRateLimit({
  name: 'auth-code-email',
  windowSeconds: 3600,
  max: 5,
  key: byEmail,
});
// 登录：同一 IP 10 分钟 20 次，同一邮箱 10 分钟 10 次
const signIpLimit = createRateLimit({
  name: 'auth-sign-ip',
  windowSeconds: 600,
  max: 20,
  key: byIp,
});
const signEmailLimit = createRateLimit({
  name: 'auth-sign-email',
  windowSeconds: 600,
  max: 10,
  key: byEmail,
});

/**
 * 发送邮箱验证码
 */
router.get(
  '/code',
  sendCodeIpLimit,
  validate(sendCodeSchema),
  sendCodeEmailLimit,
  sendCodeHandler
);

/**
 * 登录或注册
 */
router.post(
  '/sign',
  signIpLimit,
  validate(signSchema),
  signEmailLimit,
  signHandler
);

/**
 * 获取用户信息
 */
router.get('/info', validate(null, Authority.login), infoHandler);

export default router;
