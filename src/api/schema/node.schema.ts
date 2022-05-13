import { object, string } from 'zod';
import { pageSchema } from './common.schema';

// 查找笔记参数
export const findNoteSchema = object({
    query: pageSchema,
});

// 发表笔记参数
export const createNoteSchema = object({
    body: object({
        content: string({ required_error: '缺少内容' }).min(1, {
            message: '内容字数必须大于0',
        }),
    }).strict(),
});

// 删除笔记参数
export const removeNoteSchema = object({
    body: object({
        id: string({ required_error: '缺少id' }).min(1),
    }).strict(),
});
