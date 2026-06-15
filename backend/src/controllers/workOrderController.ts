import { Context } from 'koa';
import {
  getAllWorkOrders,
  getWorkOrderById,
  getWorkOrderByAppointmentId,
  updateWorkOrderStatus,
  startWorkOrder,
  completeWorkOrder,
  getWorkOrdersByUserId,
  canModifyProgress
} from '../models/WorkOrder';
import { WORK_ORDER_STATUS, WORK_ORDER_TO_APPOINTMENT, isValidStatusTransition, VALID_WORK_ORDER_TRANSITIONS } from '../utils/status';

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

  if (!canModifyProgress(existingWorkOrder.status)) {
    ctx.status = 400;
    ctx.body = {
      message: `工单当前状态为「${existingWorkOrder.status}」，已完成或已取消的工单不允许修改进度或状态`
    };
    return;
  }

  if (!status) {
    ctx.status = 400;
    ctx.body = { message: '状态不能为空' };
    return;
  }

  const validStatuses = Object.values(WORK_ORDER_STATUS);
  if (!validStatuses.includes(status as any)) {
    ctx.status = 400;
    ctx.body = { message: `无效的状态值：${status}，合法值为：${validStatuses.join('、')}` };
    return;
  }

  if (existingWorkOrder.status !== status) {
    if (!isValidStatusTransition(existingWorkOrder.status, status, VALID_WORK_ORDER_TRANSITIONS, false)) {
      ctx.status = 400;
      ctx.body = {
        message: `无法将工单状态从「${existingWorkOrder.status}」更新为「${status}」，状态跳转不合法`
      };
      return;
    }
  }

  const success = updateWorkOrderStatus(id, status, progress);
  if (!success) {
    ctx.status = 500;
    ctx.body = { message: '工单更新失败，可能是数据库事务异常或关联数据不一致' };
    return;
  }

  const syncMsg = existingWorkOrder.status !== status && WORK_ORDER_TO_APPOINTMENT[status as keyof typeof WORK_ORDER_TO_APPOINTMENT]
    ? '（预约已同步）'
    : '';

  ctx.body = { message: `工单更新成功${syncMsg}` };
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
