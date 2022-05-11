import { number, object, string, TypeOf } from 'zod';
import { randomUtil } from '../../utils';

// 创建接口
export const createUserSchema = object({
    body: object({
        email: string({ required_error: '缺少邮箱' }).email().min(1),
        avatarPath: string().min(1),
        nickname: string().min(1),
    }).strict(),
});

// 查找接口
export const findUserSchema = object({
    query: object({
        email: string({ required_error: '缺少邮箱' }).email().optional(),
    }).strict(),
});
