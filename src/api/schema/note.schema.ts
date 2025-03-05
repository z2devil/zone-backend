import { object, string, array, union } from 'zod';
import { pageSchema } from './common.schema';

// 查找笔记参数
export const findNoteSchema = object({
  params: object({
    _id: string({ required_error: '缺少id' }).min(1),
  }).strict(),
});

// 查找笔记列表参数
export const findNotesSchema = object({
  query: union([
    pageSchema
      .extend({
        search: string({ required_error: '缺少搜索内容' }).optional(),
        tags: string().optional(),
      })
      .strict(),
    object({
      _id: string({ required_error: '缺少id' }),
    }).strict(),
  ]),
});

// 查找相邻笔记参数
export const findAdjacentSchema = object({
  params: object({
    _id: string({ required_error: '缺少id' }).min(1),
  }).strict(),
});

// 发表笔记参数
export const createNoteSchema = object({
  body: object({
    title: string({ required_error: '缺少标题' })
      .min(1, {
        message: '标题字数必须大于0',
      })
      .max(150, {
        message: '标题字数必须小于150',
      }),
    content: string({ required_error: '缺少内容' }).min(1, {
      message: '内容字数必须大于0',
    }),
    bannerPath: string().optional(),
    tags: array(string())
      .max(5, {
        message: '标签最多5个',
      })
      .optional(),
  }),
});

// 删除笔记参数
export const removeNoteSchema = object({
  body: object({
    _id: string({ required_error: '缺少id' }).min(1),
  }).strict(),
});

// 阅读笔记参数
export const viewNoteSchema = object({
  query: object({
    _id: string({ required_error: '缺少id' }).min(1),
  }).strict(),
});

// 修改笔记参数
export const updateNoteSchema = object({
  body: object({
    _id: string({ required_error: '缺少id' }).min(1),
    content: string({ required_error: '缺少内容' }).min(1, {
      message: '内容字数必须大于0',
    }),
    title: string({ required_error: '缺少标题' })
      .min(1, {
        message: '标题字数必须大于0',
      })
      .max(150, {
        message: '标题字数必须小于150',
      }),
    bannerPath: string().optional(),
    tags: array(string())
      .max(5, {
        message: '标签最多5个',
      })
      .optional(),
  }),
});
