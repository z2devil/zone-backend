import { Router } from 'express';
import validate from '../middleware/validate';
import { getStatisticsHandler } from '../api/controller/statistics.controller';

const router = Router();

router.get('/', validate(null), getStatisticsHandler);

export default router;
