import { Router } from 'express';
import validate from '../middleware/validate';
import { createConfigSchema } from '../api/schema/config.schema';
import { createConfigHandler } from '../api/controller/config.controller';

const router = Router();

router.post('/create', validate(createConfigSchema), createConfigHandler);

export default router;
