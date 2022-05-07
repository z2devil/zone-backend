import { object, string, TypeOf } from 'zod';

export const createConfigSchema = object({
    body: object({
        router: string({ required_error: '缺少权限路由' }).min(1),
        action: string({ required_error: '缺少权限动作' }).min(1),
    }).strict(),
});

export type CreateConfigInput = TypeOf<typeof createConfigSchema>;
