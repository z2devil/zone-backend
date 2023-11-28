import { Router } from 'express';
import validate from '../middleware/validate';
import { Authority } from '../constant/authority';
import { getPplicyHandler } from '../api/controller/oss.controller';

const router = Router();

/**
 * 发送邮箱验证码
 */
router.get('/policy', validate(null, Authority.admin), getPplicyHandler);

export default router;
