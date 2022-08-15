import {
  createNoteSchema,
  removeNoteSchema,
  findNoteSchema,
  viewNoteSchema,
} from '../api/schema/note.schema';
import { Router } from 'express';
import validate from '../middleware/validate';
import { Authority } from '../constant/authority';
import {
  findNoteHandler,
  createNoteHandler,
  removeNoteHandler,
  viewNoteHandler,
} from '../api/controller/note.controller';

const router = Router();

/**
 * 查找笔记
 */
router.get('/', validate(findNoteSchema), findNoteHandler);

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
 * 阅读笔记
 */
router.get('/view', validate(viewNoteSchema), viewNoteHandler);

export default router;
