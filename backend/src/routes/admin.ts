import Router from 'koa-router';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import * as serviceController from '../controllers/serviceController';
import * as technicianController from '../controllers/technicianController';
import * as appointmentController from '../controllers/appointmentController';
import * as workOrderController from '../controllers/workOrderController';

const router = new Router({ prefix: '/api/admin' });

router.use(authMiddleware, adminMiddleware);

router.get('/services', serviceController.getServices);
router.post('/services', serviceController.addService);
router.put('/services/:id', serviceController.editService);
router.delete('/services/:id', serviceController.removeService);

router.get('/technicians', technicianController.getTechnicians);
router.post('/technicians', technicianController.addTechnician);
router.put('/technicians/:id', technicianController.editTechnician);
router.delete('/technicians/:id', technicianController.removeTechnician);

router.get('/appointments', appointmentController.getAppointments);
router.get('/appointments/schedule/:date', appointmentController.getScheduleByDate);
router.put('/appointments/:id/status', appointmentController.updateStatus);
router.put('/appointments/:id/technician', appointmentController.assignTechnician);

router.get('/work-orders', workOrderController.getWorkOrders);
router.get('/work-orders/:id', workOrderController.getWorkOrder);
router.put('/work-orders/:id/status', workOrderController.updateStatus);
router.put('/work-orders/:id/start', workOrderController.startOrder);
router.put('/work-orders/:id/complete', workOrderController.completeOrder);

export default router;
