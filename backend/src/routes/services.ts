import Router from 'koa-router';
import { getServices, getService } from '../controllers/serviceController';

const router = new Router({ prefix: '/api/services' });

router.get('/', getServices);
router.get('/:id', getService);

export default router;
