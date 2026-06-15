import { Context } from 'koa';
import {
  checkTimeConflict,
  getAppointmentsByUserId,
  getAppointmentById,
  getAllAppointments,
  updateAppointmentStatus,
  getAppointmentsByDate,
  findAvailableTechnician,
  createAppointmentWithOrder
} from '../models/Appointment';
import { getServiceById } from '../models/Service';
import { getTechnicianById } from '../models/Technician';
import { assignTechnicianWithConflictCheck } from '../models/Appointment';
import {
  isValidDateFormat,
  isValidTimeSlot,
  isWithinBusinessHours,
  timeToMinutes
} from '../utils/status';

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

  if (!isValidDateFormat(date)) {
    ctx.status = 400;
    ctx.body = { message: '日期格式无效，请使用 YYYY-MM-DD 格式' };
    return;
  }

  if (!isValidTimeSlot(time)) {
    ctx.status = 400;
    ctx.body = { message: '时间格式无效或不符合预约粒度（30分钟），请选择 00 或 30 分的整点时间' };
    return;
  }

  const service = getServiceById(serviceId);
  if (!service) {
    ctx.status = 400;
    ctx.body = { message: '服务项目不存在' };
    return;
  }

  if (!isWithinBusinessHours(time, service.duration)) {
    ctx.status = 400;
    ctx.body = {
      message: '服务时长超出营业时间范围（09:00-12:00，14:00-18:00），请缩短时长或选择其他时段'
    };
    return;
  }

  let finalTechnicianId: number;

  if (technicianId) {
    const technician = getTechnicianById(technicianId);
    if (!technician) {
      ctx.status = 400;
      ctx.body = { message: '指定的技师不存在' };
      return;
    }
    if (technician.status !== 'active') {
      ctx.status = 400;
      ctx.body = { message: '该技师已停用，无法预约' };
      return;
    }

    const hasConflict = checkTimeConflict(technicianId, date, time, service.duration);
    if (hasConflict) {
      ctx.status = 400;
      ctx.body = { message: '该技师在该时段已有预约，请选择其他时间或技师' };
      return;
    }

    finalTechnicianId = technicianId;
  } else {
    const availableTechId = findAvailableTechnician(date, time, service.duration);
    if (!availableTechId) {
      ctx.status = 400;
      ctx.body = { message: '该时段所有技师均已预约，请选择其他时间' };
      return;
    }
    finalTechnicianId = availableTechId;
  }

  try {
    const { appointmentId, workOrderId } = createAppointmentWithOrder(
      userId,
      serviceId,
      finalTechnicianId,
      date,
      time,
      carInfo,
      description
    );

    ctx.status = 201;
    ctx.body = {
      message: '预约成功',
      id: appointmentId,
      workOrderId
    };
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

  const success = updateAppointmentStatus(id, status);
  if (!success) {
    ctx.status = 400;
    ctx.body = {
      message: `无法将预约状态从「${existingAppointment.status}」更新为「${status}」，状态跳转不合法`
    };
    return;
  }

  ctx.body = { message: '预约状态更新成功（工单已同步）' };
};

export const assignTechnician = async (ctx: Context) => {
  const id = parseInt(ctx.params.id);
  const { technicianId } = ctx.request.body as { technicianId: number };

  if (!technicianId) {
    ctx.status = 400;
    ctx.body = { message: '技师ID不能为空' };
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

  const result = assignTechnicianWithConflictCheck(id, technicianId);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = { message: result.message };
    return;
  }

  ctx.body = { message: result.message };
};

export const getScheduleByDate = async (ctx: Context) => {
  const { date } = ctx.params;

  if (!isValidDateFormat(date)) {
    ctx.status = 400;
    ctx.body = { message: '日期格式无效' };
    return;
  }

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

  if (!date || !time || !duration) {
    ctx.status = 400;
    ctx.body = { message: '日期、时间和时长必填' };
    return;
  }

  if (!isValidDateFormat(date) || !isValidTimeSlot(time)) {
    ctx.status = 400;
    ctx.body = { message: '日期或时间格式无效' };
    return;
  }

  let hasConflict: boolean;

  if (technicianId) {
    const technician = getTechnicianById(technicianId);
    if (!technician || technician.status !== 'active') {
      ctx.status = 400;
      ctx.body = { message: '指定的技师不存在或已停用' };
      return;
    }
    hasConflict = checkTimeConflict(technicianId, date, time, duration);
  } else {
    const availableTechId = findAvailableTechnician(date, time, duration);
    hasConflict = availableTechId === null;
  }

  ctx.body = { hasConflict };
};
