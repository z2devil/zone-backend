import { Router } from 'express';
import validate from '../middleware/validate';
import { createUserSchema, findUserSchema } from '../schema/user.schema';
import {
    createUserHandler,
    findUserHandler,
} from '../controller/user.controller';

const router = Router();

// 需要校验接口参数的，加上校验中间件
router.post('/create', validate(createUserSchema), createUserHandler);

router.get('/find', validate(findUserSchema), findUserHandler);

router.delete('/remove', validate(findUserSchema), findUserHandler);

export default router;
