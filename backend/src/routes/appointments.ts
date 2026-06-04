import Router from 'koa-router';
import {
  addAppointment,
  getMyAppointments,
  getAppointment,
  checkConflict
} from '../controllers/appointmentController';
import { authMiddleware } from '../middleware/auth';

const router = new Router({ prefix: '/api/appointments' });

router.use(authMiddleware);

router.post('/', addAppointment);
router.get('/my', getMyAppointments);
router.get('/:id', getAppointment);
router.post('/check-conflict', checkConflict);

export default router;
