import { Router } from 'express';
import validate from '../middleware/validate';
import { sendCodeSchema } from '../api/schema/auth.schema';
import { sendCodeHandler } from '../api/controller/auth.controller';

const router = Router();

/**
 * 测试redis
 */
router.get('/code', validate(sendCodeSchema), sendCodeHandler);

export default router;
