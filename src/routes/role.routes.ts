import { Router } from 'express';
import validate from '../middleware/validate';
import {
  createRoleSchema,
  findRoleSchema,
  getRolePermissionSchema,
  removeRoleSchema,
  updateRoleSchema,
  updateRolePermissionSchema,
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
  validate(removeRoleSchema, Authority.admin),
  removeRoleHandler
);

/**
 * 更新用户
 */
router.put('/', validate(updateRoleSchema, Authority.admin), updateRoleHandler);

/**
 * 获取角色权限列表
 */
router.get(
  '/:roleId/permission',
  validate(getRolePermissionSchema, Authority.admin),
  getRolePermissionListHandler
);

/**
 * 设置角色权限
 */
router.put(
  '/:roleId/permission',
  validate(updateRolePermissionSchema, Authority.admin),
  updateRolePermissionHandler
);

export default router;
