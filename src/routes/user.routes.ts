import { Router } from 'express';
import validate from '../middleware/validate';
import { createUserSchema, findUserSchema } from '../api/schema/user.schema';
import {
  createUserHandler,
  findUserHandler,
} from '../api/controller/user.controller';
import { Authority } from '../constant/authority';

const router = Router();

/**
 * 创建用户
 */
router.post('/', validate(createUserSchema), createUserHandler);

/**
 * 查找用户
 */
router.get('/', validate(findUserSchema), findUserHandler);

/**
 * 删除用户
 */
router.delete('/', validate(findUserSchema), findUserHandler);

/**
 * 测试权限
 */
router.get('/test', validate(findUserSchema, Authority.login), findUserHandler);

export default router;
