import { z } from 'zod';

export const generateTitleSchema = z.object({
  body: z.object({
    content: z.string().min(1, '内容不能为空').max(50000, '内容过长'),
  }),
});

export const generateSummarySchema = z.object({
  body: z.object({
    content: z.string().min(1, '内容不能为空').max(50000, '内容过长'),
  }),
});
