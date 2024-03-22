import { object, string } from 'zod';
import { pageSchema } from './common.schema';

export const findTagSchema = object({
  query: pageSchema
    .extend({
      search: string({ required_error: '缺少搜索内容' }).optional(),
    })
    .strict(),
});

export const createTagSchema = object({
  body: object({
    label: string({ required_error: '缺少标签名' }).min(1),
  }).strict(),
});

export const putTagSchema = object({
  body: object({
    _id: string({ required_error: '缺少id' }).min(1),
    label: string({ required_error: '缺少标签名' }).min(1),
  }).strict(),
});

export const deleteTagSchema = object({
  body: object({
    _id: string({ required_error: '缺少id' }).min(1),
  }).strict(),
});
