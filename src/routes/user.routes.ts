import { Router } from 'express';
import validate from '../middleware/validate';
import {
  createUserSchema,
  findUserListSchema,
  findUserSchema,
  updateUserSchema,
} from '../api/schema/user.schema';
import {
  createUserHandler,
  findUserHandler,
  findUserListHandler,
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
 * 查找用户列表
 */
router.get(
  '/list',
  validate(findUserListSchema, Authority.admin),
  findUserListHandler
);

/**
 * 测试权限
 */
router.get('/test', validate(findUserSchema, Authority.login), findUserHandler);

export default router;
