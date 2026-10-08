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
router.post(
  '/',
  validate(createUserSchema, Authority.admin),
  createUserHandler
);

/**
 * 查找用户
 */
router.get('/', validate(findUserSchema, Authority.admin), findUserHandler);

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

export default router;
