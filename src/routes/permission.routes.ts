import { Router } from 'express';
import validate from '../middleware/validate';
import {
  createPermissionSchema,
  findPermissionSchema,
  removePermissionSchema,
  updatePermissionSchema,
} from '../api/schema/permission.schema';
import { Authority } from '../constant/authority';
import {
  createPermissionHandler,
  findPermissionHandler,
  removePermissionHandler,
  updatePermissionHandler,
} from '../api/controller/permission.controller';

const router = Router();

/**
 * 创建权限
 */
router.post(
  '/',
  validate(createPermissionSchema, Authority.admin),
  createPermissionHandler
);

/**
 * 删除权限
 */
router.delete(
  '/',
  validate(removePermissionSchema, Authority.admin),
  removePermissionHandler
);

/**
 * 查找权限
 */
router.get(
  '/',
  validate(findPermissionSchema, Authority.admin),
  findPermissionHandler
);

/**
 * 更新权限
 */
router.put(
  '/',
  validate(updatePermissionSchema, Authority.admin),
  updatePermissionHandler
);

export default router;
