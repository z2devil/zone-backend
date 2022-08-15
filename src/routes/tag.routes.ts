import { Router } from 'express';
import validate from '../middleware/validate';
import {
  createTagSchema,
  findTagSchema,
  deleteTagSchema,
} from '../api/schema/tag.schema';
import {
  createTagHandler,
  findTagHandler,
  deleteTagHandler,
} from '../api/controller/tag.controller';

const router = Router();

router.post('/', validate(createTagSchema), createTagHandler);

router.get('/', validate(findTagSchema), findTagHandler);

router.delete('/', validate(deleteTagSchema), deleteTagHandler);

export default router;
