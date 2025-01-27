import { Router } from 'express';
import validate from '../middleware/validate';
import {
  createRoleSchema,
  findRoleSchema,
  updateRoleSchema,
} from '../api/schema/role.schema';
import { Authority } from '../constant/authority';
import {
  createRoleHandler,
  findRoleHandler,
  removeRoleHandler,
  updateRoleHandler,
  getRolePermissionListHandler,
  updateRolePermissionHandler,
} from '../api/controller/role.controller';

const router = Router();

/**
 * 创建用户
 */
router.post(
  '/',
  validate(createRoleSchema, Authority.admin),
  createRoleHandler
);

/**
 * 查找用户
 */
router.get('/', validate(findRoleSchema, Authority.admin), findRoleHandler);

/**
 * 删除用户
 */
router.delete(
  '/',
  validate(findRoleSchema, Authority.admin),
  removeRoleHandler
);

/**
 * 更新用户
 */
router.put('/', validate(updateRoleSchema, Authority.admin), updateRoleHandler);

/**
 * 获取角色权限列表
 */
router.get('/:roleId/permission', getRolePermissionListHandler);

/**
 * 设置角色权限
 */
router.put('/:roleId/permission', updateRolePermissionHandler);

export default router;
