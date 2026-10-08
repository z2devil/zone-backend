import { array, object, string } from 'zod';
import { pageSchema } from './common.schema';

// 创建
export const createRoleSchema = object({
  body: object({
    name: string({ required_error: '缺少名称' }).min(1).max(20),
  }).strict(),
});

// 查找
export const findRoleSchema = object({
  query: pageSchema.or(
    object({
      name: string(),
    }).strict()
  ),
});

// 更新
export const updateRoleSchema = object({
  body: object({
    _id: string({ required_error: '缺少 _id' }),
    name: string().optional(),
  }).strict(),
});

// 查找列表
export const findRoleListSchema = object({
  query: pageSchema,
});

const objectIdSchema = string().regex(/^[a-f\d]{24}$/i, '无效的 id');

// 获取角色权限
export const getRolePermissionSchema = object({
  params: object({
    roleId: objectIdSchema,
  }).strict(),
});

// 设置角色权限
export const updateRolePermissionSchema = object({
  params: object({
    roleId: objectIdSchema,
  }).strict(),
  body: object({
    // 前端会在 body 中冗余携带 roleId，以 params 为准
    roleId: string().optional(),
    permissionIds: array(objectIdSchema),
  }).strict(),
});
