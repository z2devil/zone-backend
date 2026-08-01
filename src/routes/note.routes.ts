import {
  createNoteSchema,
  removeNoteSchema,
  findNoteSchema,
  viewNoteSchema,
  updateNoteSchema,
  findNotesSchema,
  findAdjacentSchema,
} from '../api/schema/note.schema';
import { Router } from 'express';
import validate from '../middleware/validate';
import { Authority } from '../constant/authority';
import {
  findNoteHandler,
  createNoteHandler,
  removeNoteHandler,
  viewNoteHandler,
  updateNoteHandler,
  findNotesHandler,
  findAdjacentHandler,
} from '../api/controller/note.controller';

const router = Router();

/**
 * 查找笔记列表
 */
router.get('/', validate(findNotesSchema), findNotesHandler);

/**
 * 查找相邻笔记
 */
router.get('/adjacent/:_id', validate(findAdjacentSchema), findAdjacentHandler);

/**
 * 阅读笔记
 */
router.get('/view', validate(viewNoteSchema), viewNoteHandler);

/**
 * 查找笔记（动态路由必须放在静态路由之后）
 */
router.get('/:_id', validate(findNoteSchema), findNoteHandler);

/**
 * 发表笔记
 */
router.post(
  '/',
  validate(createNoteSchema, Authority.admin),
  createNoteHandler
);

/**
 * 删除笔记
 */
router.delete(
  '/',
  validate(removeNoteSchema, Authority.admin),
  removeNoteHandler
);

/**
 * 修改笔记
 */
router.put('/', validate(updateNoteSchema, Authority.admin), updateNoteHandler);

export default router;
