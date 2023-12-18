import { object, string, discriminatedUnion, literal, array, union } from 'zod';
import { NoteType } from '../models/note.model';
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
        type: string({ required_error: '缺少搜索类型' })
          .transform<number>(i => {
            return Number.parseInt(i);
          })
          .refine(i => NoteType[i], { message: '搜索类型错误' })
          .optional(),
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
  body: discriminatedUnion('type', [
    object({
      type: literal(NoteType.Normal),
      content: string({ required_error: '缺少内容' })
        .min(1, {
          message: '内容字数必须大于0',
        })
        .max(3000, {
          message: '内容字数必须小于3000',
        }),
    }),
    object({
      type: literal(NoteType.Article),
      content: string({ required_error: '缺少内容' })
        .min(1, {
          message: '内容字数必须大于0',
        })
        .max(10000, {
          message: '内容字数必须小于30000',
        }),
      bannerPath: string().optional(),
      title: string({ required_error: '缺少标题' })
        .min(1, {
          message: '标题字数必须大于0',
        })
        .max(150, {
          message: '标题字数必须小于150',
        }),
      summary: string({ required_error: '缺少摘要' })
        .min(1, {
          message: '摘要字数必须大于0',
        })
        .max(500, {
          message: '摘要字数必须小于500',
        }),
      tags: array(string())
        .max(5, {
          message: '标签最多5个',
        })
        .optional(),
    }),
  ]),
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
  body: discriminatedUnion('type', [
    object({
      _id: string({ required_error: '缺少id' }).min(1),
      type: literal(NoteType.Normal),
      content: string({ required_error: '缺少内容' })
        .min(1, {
          message: '内容字数必须大于0',
        })
        .max(3000, {
          message: '内容字数必须小于3000',
        }),
    }),
    object({
      _id: string({ required_error: '缺少id' }).min(1),
      type: literal(NoteType.Article),
      content: string({ required_error: '缺少内容' })
        .min(1, {
          message: '内容字数必须大于0',
        })
        .max(10000, {
          message: '内容字数必须小于30000',
        }),
      bannerPath: string().optional(),
      title: string({ required_error: '缺少标题' })
        .min(1, {
          message: '标题字数必须大于0',
        })
        .max(150, {
          message: '标题字数必须小于150',
        }),
      summary: string({ required_error: '缺少摘要' })
        .min(1, {
          message: '摘要字数必须大于0',
        })
        .max(500, {
          message: '摘要字数必须小于500',
        }),
      tags: array(string())
        .max(5, {
          message: '标签最多5个',
        })
        .optional(),
    }),
  ]),
});
