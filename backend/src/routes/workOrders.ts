import Router from 'koa-router';
import {
  getMyWorkOrders,
  getWorkOrder,
  getWorkOrderByAppointment
} from '../controllers/workOrderController';
import { authMiddleware } from '../middleware/auth';

const router = new Router({ prefix: '/api/work-orders' });

router.use(authMiddleware);

router.get('/my', getMyWorkOrders);
router.get('/:id', getWorkOrder);
router.get('/appointment/:appointmentId', getWorkOrderByAppointment);

export default router;
