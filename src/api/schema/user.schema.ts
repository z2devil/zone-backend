import { object, string } from 'zod';
import { pageSchema } from './common.schema';

// 创建接口
export const createUserSchema = object({
  body: object({
    email: string({ required_error: '缺少邮箱' }).email().min(1),
    avatarPath: string().optional(),
    nickname: string().optional(),
  }).strict(),
});

// 查找接口
export const findUserSchema = object({
  query: pageSchema.or(
    object({
      email: string().email(),
    }).strict()
  ),
});
