import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { PORT } from './config/jwt';
import authRoutes from './routes/auth';
import serviceRoutes from './routes/services';
import appointmentRoutes from './routes/appointments';
import technicianRoutes from './routes/technicians';
import workOrderRoutes from './routes/workOrders';
import adminRoutes from './routes/admin';

const app = new Koa();

app.use(cors({
  origin: 'http://localhost:5102',
  credentials: true
}));

app.use(bodyParser());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: any) {
    ctx.status = err.status || 500;
    ctx.body = { message: err.message || '服务器内部错误' };
  }
});

app.use(authRoutes.routes()).use(authRoutes.allowedMethods());
app.use(serviceRoutes.routes()).use(serviceRoutes.allowedMethods());
app.use(appointmentRoutes.routes()).use(appointmentRoutes.allowedMethods());
app.use(technicianRoutes.routes()).use(technicianRoutes.allowedMethods());
app.use(workOrderRoutes.routes()).use(workOrderRoutes.allowedMethods());
app.use(adminRoutes.routes()).use(adminRoutes.allowedMethods());

app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
});

export default app;
