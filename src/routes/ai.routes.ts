import { Router } from 'express';
import validate from '../middleware/validate';
import { Authority } from '../constant/authority';
import {
  generateTitleSchema,
  generateSummarySchema,
} from '../api/schema/ai.schema';
import {
  generateTitleHandler,
  generateSummaryHandler,
} from '../api/controller/ai.controller';

const router = Router();

router.post(
  '/generate-title',
  validate(generateTitleSchema, Authority.admin),
  generateTitleHandler
);

router.post(
  '/generate-summary',
  validate(generateSummarySchema, Authority.admin),
  generateSummaryHandler
);

export default router;
