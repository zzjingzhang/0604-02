import { Context } from 'koa';
import {
  checkTimeConflict,
  createAppointment,
  getAppointmentsByUserId,
  getAppointmentById,
  getAllAppointments,
  updateAppointmentStatus,
  updateAppointmentTechnician,
  getAppointmentsByDate
} from '../models/Appointment';
import { getServiceById } from '../models/Service';
import { createWorkOrder } from '../models/WorkOrder';
import { getTechnicianById } from '../models/Technician';

export const addAppointment = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  const { serviceId, technicianId, date, time, carInfo, description } = ctx.request.body as {
    serviceId: number;
    technicianId?: number;
    date: string;
    time: string;
    carInfo?: string;
    description?: string;
  };

  if (!serviceId || !date || !time) {
    ctx.status = 400;
    ctx.body = { message: '服务项目、日期和时间不能为空' };
    return;
  }

  const service = getServiceById(serviceId);
  if (!service) {
    ctx.status = 404;
    ctx.body = { message: '服务项目不存在' };
    return;
  }

  const hasConflict = checkTimeConflict(technicianId || null, date, time, service.duration);
  if (hasConflict) {
    ctx.status = 400;
    ctx.body = { message: '该时间段已有预约，请选择其他时间' };
    return;
  }

  const [hours] = time.split(':').map(Number);
  if (hours < 9 || hours >= 18) {
    ctx.status = 400;
    ctx.body = { message: '预约时间需在工作时间内（09:00 - 18:00）' };
    return;
  }

  try {
    const appointmentId = createAppointment(
      userId,
      serviceId,
      technicianId || null,
      date,
      time,
      carInfo,
      description
    );

    createWorkOrder(appointmentId);

    ctx.status = 201;
    ctx.body = { message: '预约成功', id: appointmentId };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '预约失败', error };
  }
};

export const getMyAppointments = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  const appointments = getAppointmentsByUserId(userId);
  ctx.body = { appointments };
};

export const getAppointment = async (ctx: Context) => {
  const id = parseInt(ctx.params.id);
  const userId = ctx.state.user.id;
  const userRole = ctx.state.user.role;

  const appointment = getAppointmentById(id);

  if (!appointment) {
    ctx.status = 404;
    ctx.body = { message: '预约不存在' };
    return;
  }

  if (userRole !== 'admin' && appointment.user_id !== userId) {
    ctx.status = 403;
    ctx.body = { message: '无权查看此预约' };
    return;
  }

  ctx.body = { appointment };
};

export const getAppointments = async (ctx: Context) => {
  const appointments = getAllAppointments();
  ctx.body = { appointments };
};

export const updateStatus = async (ctx: Context) => {
  const id = parseInt(ctx.params.id);
  const { status } = ctx.request.body as { status: string };

  const existingAppointment = getAppointmentById(id);
  if (!existingAppointment) {
    ctx.status = 404;
    ctx.body = { message: '预约不存在' };
    return;
  }

  try {
    updateAppointmentStatus(id, status);
    ctx.body = { message: '预约状态更新成功' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '更新预约状态失败', error };
  }
};

export const assignTechnician = async (ctx: Context) => {
  const id = parseInt(ctx.params.id);
  const { technicianId } = ctx.request.body as { technicianId: number };

  if (!technicianId) {
    ctx.status = 400;
    ctx.body = { message: '技师ID不能为空' };
    return;
  }

  const existingAppointment = getAppointmentById(id);
  if (!existingAppointment) {
    ctx.status = 404;
    ctx.body = { message: '预约不存在' };
    return;
  }

  const technician = getTechnicianById(technicianId);
  if (!technician) {
    ctx.status = 400;
    ctx.body = { message: '指定的技师不存在' };
    return;
  }

  if (technician.status !== 'active') {
    ctx.status = 400;
    ctx.body = { message: '该技师已停用，无法分配' };
    return;
  }

  const service = getServiceById(existingAppointment.service_id);
  if (!service) {
    ctx.status = 400;
    ctx.body = { message: '关联的服务项目不存在' };
    return;
  }

  const hasConflict = checkTimeConflict(
    technicianId,
    existingAppointment.appointment_date,
    existingAppointment.appointment_time,
    service.duration,
    id
  );
  if (hasConflict) {
    ctx.status = 400;
    ctx.body = { message: '该技师在此时段已有其他预约，存在时间冲突' };
    return;
  }

  try {
    updateAppointmentTechnician(id, technicianId);
    ctx.body = { message: '技师分配成功' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '分配技师失败', error };
  }
};

export const getScheduleByDate = async (ctx: Context) => {
  const { date } = ctx.params;
  const appointments = getAppointmentsByDate(date);
  ctx.body = { appointments };
};

export const checkConflict = async (ctx: Context) => {
  const { technicianId, date, time, duration } = ctx.request.body as {
    technicianId?: number;
    date: string;
    time: string;
    duration: number;
  };

  const hasConflict = checkTimeConflict(technicianId || null, date, time, duration);
  ctx.body = { hasConflict };
};
