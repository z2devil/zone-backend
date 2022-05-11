import { signSchema } from './../api/schema/auth.schema';
import { Router } from 'express';
import validate from '../middleware/validate';
import { sendCodeSchema } from '../api/schema/auth.schema';
import {
    signHandler,
    sendCodeHandler,
} from '../api/controller/auth.controller';

const router = Router();

/**
 * 发送邮箱验证码
 */
router.get('/code', validate(sendCodeSchema), sendCodeHandler);

router.post('/sign', validate(signSchema), signHandler);

export default router;
