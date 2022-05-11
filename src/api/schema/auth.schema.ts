import { number, object, string, TypeOf } from 'zod';

// 发送验证码接口
export const sendCodeSchema = object({
    query: object({
        email: string({ required_error: '缺少邮箱' }).email().min(1),
    }).strict(),
});

// 登录或注册接口
export const signSchema = object({
    body: object({
        email: string({ required_error: '缺少邮箱' }).email().min(1),
        code: string({ required_error: '缺少验证码' }).min(1),
    }).strict(),
});
