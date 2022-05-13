import {
    createNoteSchema,
    removeNoteSchema,
} from './../api/schema/node.schema';
import { Router } from 'express';
import validate from '../middleware/validate';
import { Authority } from '../constants/authority';
import { findNoteSchema } from '../api/schema/node.schema';
import {
    findNoteHandler,
    createNoteHandler,
    removeNoteHandler,
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

export default router;
