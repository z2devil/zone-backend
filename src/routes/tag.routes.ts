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
import { Authority } from '../constant/authority';

const router = Router();

router.get('/', validate(findTagSchema), findTagHandler);

router.post('/', validate(createTagSchema, Authority.admin), createTagHandler);

router.put('/', validate(putTagSchema, Authority.admin), createTagHandler);

router.delete(
  '/',
  validate(deleteTagSchema, Authority.admin),
  deleteTagHandler
);

export default router;
