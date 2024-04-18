import { Router } from 'express';
import validate from '../middleware/validate';
import { categoryHandler } from '../api/controller/aggregate.controlle';

const router = Router();

/**
 * 获取标签分类列表
 */
router.get('/category', validate(null), categoryHandler);

export default router;
