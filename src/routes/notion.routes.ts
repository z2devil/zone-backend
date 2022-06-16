import { Router } from 'express';
import { findNotionHandler } from '../api/controller/notion.controller';

const router = Router();

/**
 * 查找笔记
 */
router.get('/', findNotionHandler);

export default router;
