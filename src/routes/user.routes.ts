import { Router } from 'express';
import validate from '../middleware/validate';
import {
  createUserSchema,
  findUserSchema,
  updateUserSchema,
} from '../api/schema/user.schema';
import {
  createUserHandler,
  findUserHandler,
  updateUserHandler,
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
 * 更新用户
 */
router.put('/', validate(updateUserSchema, Authority.login), updateUserHandler);

/**
 * 测试权限
 */
router.get('/test', validate(findUserSchema, Authority.login), findUserHandler);

export default router;
