import { number, object, string, TypeOf } from 'zod';

// 发送验证码接口
export const sendCodeSchema = object({
    query: object({
        email: string({ required_error: '缺少邮箱' }).email().min(1),
    }).strict(),
});

export type sendCodeInput = TypeOf<typeof sendCodeSchema>;
