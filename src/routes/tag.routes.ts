import { Router } from 'express';
import validate from '../middleware/validate';
import {
  createTagSchema,
  findTagSchema,
  deleteTagSchema,
  putTagSchema,
} from '../api/schema/tag.schema';
import {
  createTagHandler,
  findTagHandler,
  deleteTagHandler,
} from '../api/controller/tag.controller';

const router = Router();

router.get('/', validate(findTagSchema), findTagHandler);

router.post('/', validate(createTagSchema), createTagHandler);

router.put('/', validate(putTagSchema), createTagHandler);

router.delete('/', validate(deleteTagSchema), deleteTagHandler);

export default router;
