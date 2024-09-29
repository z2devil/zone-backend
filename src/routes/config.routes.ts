import { Router } from 'express';
import validate from '../middleware/validate';
import { createConfigSchema } from '../api/schema/config.schema';
import {
  createConfigHandler,
  errorHandler,
  processHandler,
  successHandler,
  testHandler,
} from '../api/controller/config.controller';

const router = Router();

router.post('/create', validate(createConfigSchema), createConfigHandler);

router.post('/process', validate(null), processHandler);

router.post('/success', validate(null), successHandler);

router.post('/error', validate(null), errorHandler);

router.post('/test', validate(null), testHandler);

export default router;
