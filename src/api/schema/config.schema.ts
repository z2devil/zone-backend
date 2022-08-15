import { object, string } from 'zod';

export const createConfigSchema = object({
  body: object({
    label: string({ required_error: '缺少配置名' }).min(1),
    value: string({ required_error: '缺少配置内容' }).min(1),
  }).strict(),
});
