import { object, string } from 'zod';
import { pageSchema } from './common.schema';

export const createTagSchema = object({
  body: object({
    label: string({ required_error: '缺少标签名' }).min(1),
  }).strict(),
});

export const findTagSchema = object({
  query: pageSchema.or(
    object({
      label: string({ required_error: '缺少标签名' }).min(1),
    }).strict()
  ),
});

export const deleteTagSchema = object({
  body: object({
    _id: string({ required_error: '缺少id' }).min(1),
  }).strict(),
});
