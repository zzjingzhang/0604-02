import { Context } from 'koa';
import {
  getAllWorkOrders,
  getWorkOrderById,
  getWorkOrderByAppointmentId,
  updateWorkOrderStatus,
  startWorkOrder,
  completeWorkOrder,
  getWorkOrdersByUserId
} from '../models/WorkOrder';

export const getWorkOrders = async (ctx: Context) => {
  const workOrders = getAllWorkOrders();
  ctx.body = { workOrders };
};

export const getMyWorkOrders = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  const workOrders = getWorkOrdersByUserId(userId);
  ctx.body = { workOrders };
};

export const getWorkOrder = async (ctx: Context) => {
  const id = parseInt(ctx.params.id);
  const userId = ctx.state.user.id;
  const userRole = ctx.state.user.role;

  const workOrder = getWorkOrderById(id);

  if (!workOrder) {
    ctx.status = 404;
    ctx.body = { message: '工单不存在' };
    return;
  }

  if (userRole !== 'admin') {
    const userWorkOrders = getWorkOrdersByUserId(userId);
    const hasAccess = userWorkOrders.some(wo => wo.id === id);
    if (!hasAccess) {
      ctx.status = 403;
      ctx.body = { message: '无权查看此工单' };
      return;
    }
  }

  ctx.body = { workOrder };
};

export const getWorkOrderByAppointment = async (ctx: Context) => {
  const appointmentId = parseInt(ctx.params.appointmentId);
  const userId = ctx.state.user.id;
  const userRole = ctx.state.user.role;

  const workOrder = getWorkOrderByAppointmentId(appointmentId);

  if (!workOrder) {
    ctx.status = 404;
    ctx.body = { message: '工单不存在' };
    return;
  }

  if (userRole !== 'admin') {
    const userWorkOrders = getWorkOrdersByUserId(userId);
    const hasAccess = userWorkOrders.some(wo => wo.id === workOrder.id);
    if (!hasAccess) {
      ctx.status = 403;
      ctx.body = { message: '无权查看此工单' };
      return;
    }
  }

  ctx.body = { workOrder };
};

export const updateStatus = async (ctx: Context) => {
  const id = parseInt(ctx.params.id);
  const { status, progress } = ctx.request.body as {
    status: string;
    progress?: string;
  };

  const existingWorkOrder = getWorkOrderById(id);
  if (!existingWorkOrder) {
    ctx.status = 404;
    ctx.body = { message: '工单不存在' };
    return;
  }

  const success = updateWorkOrderStatus(id, status, progress);
  if (!success) {
    ctx.status = 400;
    ctx.body = {
      message: `无法将工单状态从「${existingWorkOrder.status}」更新为「${status}」，状态跳转不合法`
    };
    return;
  }

  ctx.body = { message: '工单状态更新成功（预约已同步）' };
};

export const startOrder = async (ctx: Context) => {
  const id = parseInt(ctx.params.id);

  const existingWorkOrder = getWorkOrderById(id);
  if (!existingWorkOrder) {
    ctx.status = 404;
    ctx.body = { message: '工单不存在' };
    return;
  }

  const success = startWorkOrder(id);
  if (!success) {
    ctx.status = 400;
    ctx.body = {
      message: `无法开始工单：当前状态「${existingWorkOrder.status}」不允许开始维修`
    };
    return;
  }

  ctx.body = { message: '工单已开始（预约状态已同步为维修中）' };
};

export const completeOrder = async (ctx: Context) => {
  const id = parseInt(ctx.params.id);

  const existingWorkOrder = getWorkOrderById(id);
  if (!existingWorkOrder) {
    ctx.status = 404;
    ctx.body = { message: '工单不存在' };
    return;
  }

  const success = completeWorkOrder(id);
  if (!success) {
    ctx.status = 400;
    ctx.body = {
      message: `无法完成工单：当前状态「${existingWorkOrder.status}」不允许标记完成`
    };
    return;
  }

  ctx.body = { message: '工单已完成（预约状态已同步为已完成）' };
};
