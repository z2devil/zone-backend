import { object, string } from 'zod';
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
