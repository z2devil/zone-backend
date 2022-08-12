import { signSchema, sendCodeSchema } from './../api/schema/auth.schema';
import { Router } from 'express';
import validate from '../middleware/validate';
import {
  signHandler,
  sendCodeHandler,
  infoHandler,
} from '../api/controller/auth.controller';
import { Authority } from '../constant/authority';

const router = Router();

/**
 * 发送邮箱验证码
 */
router.get('/code', validate(sendCodeSchema), sendCodeHandler);

/**
 * 登录或注册
 */
router.post('/sign', validate(signSchema), signHandler);

/**
 * 获取用户信息
 */
router.get('/info', validate(null, Authority.login), infoHandler);

export default router;
