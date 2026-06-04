import Router from 'koa-router';
import { getActiveTechs } from '../controllers/technicianController';
import { authMiddleware } from '../middleware/auth';

const router = new Router({ prefix: '/api/technicians' });

router.use(authMiddleware);

router.get('/active', getActiveTechs);

export default router;
