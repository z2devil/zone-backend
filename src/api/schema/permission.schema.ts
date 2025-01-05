import { object, string } from 'zod';
import { pageSchema } from './common.schema';

// 创建
export const createPermissionSchema = object({
  body: object({
    name: string({ required_error: '缺少名称' }).min(1).max(20),
    description: string({ required_error: '缺少描述' }).optional(),
  }).strict(),
});

// 删除
export const removePermissionSchema = object({
  body: object({
    _id: string({ required_error: '缺少 _id' }),
  }).strict(),
});

// 查找
export const findPermissionSchema = object({
  query: pageSchema.or(
    object({
      name: string(),
      description: string().optional(),
    }).strict()
  ),
});

// 更新
export const updatePermissionSchema = object({
  body: object({
    _id: string({ required_error: '缺少 _id' }),
    name: string().optional(),
    description: string().optional(),
  }).strict(),
});
