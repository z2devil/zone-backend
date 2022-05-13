import { any, number, object, string } from 'zod';

// 分页参数
export const pageSchema = object({
    current: any()
        .transform<number>(i => {
            return Number.parseInt(i);
        })
        .refine(i => i > 0, { message: '页码必须为大于0的整数' }),
    size: any()
        .transform<number>(i => {
            return Number.parseInt(i);
        })
        .refine(i => i >= 1 && i <= 50, {
            message: '每页数据量必须为1-50的整数',
        }),
    orders: string().optional(),
}).strict();
