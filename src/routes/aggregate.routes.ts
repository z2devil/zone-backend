import { Router } from 'express';
import validate from '../middleware/validate';
import { categorySchema } from '../api/schema/aggregate.schema';
import { categoryHandler } from '../api/controller/aggregate.controlle';

const router = Router();

/**
 * 获取标签分类列表
 */
router.get('/category', validate(categorySchema), categoryHandler);

export default router;
