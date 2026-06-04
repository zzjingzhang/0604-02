import { Context } from 'koa';
import {
  getAllTechnicians,
  getActiveTechnicians,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  deleteTechnician
} from '../models/Technician';

export const getTechnicians = async (ctx: Context) => {
  const technicians = getAllTechnicians();
  ctx.body = { technicians };
};

export const getActiveTechs = async (ctx: Context) => {
  const technicians = getActiveTechnicians();
  ctx.body = { technicians };
};

export const getTechnician = async (ctx: Context) => {
  const id = parseInt(ctx.params.id);
  const technician = getTechnicianById(id);

  if (!technician) {
    ctx.status = 404;
    ctx.body = { message: '技师不存在' };
    return;
  }

  ctx.body = { technician };
};

export const addTechnician = async (ctx: Context) => {
  const { name, phone, specialty } = ctx.request.body as {
    name: string;
    phone: string;
    specialty: string;
  };

  if (!name) {
    ctx.status = 400;
    ctx.body = { message: '技师姓名不能为空' };
    return;
  }

  try {
    const id = createTechnician(name, phone, specialty);
    ctx.status = 201;
    ctx.body = { message: '技师创建成功', id };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '创建技师失败', error };
  }
};

export const editTechnician = async (ctx: Context) => {
  const id = parseInt(ctx.params.id);
  const { name, phone, specialty, status } = ctx.request.body as {
    name: string;
    phone: string;
    specialty: string;
    status: string;
  };

  const existingTechnician = getTechnicianById(id);
  if (!existingTechnician) {
    ctx.status = 404;
    ctx.body = { message: '技师不存在' };
    return;
  }

  try {
    updateTechnician(id, name, phone, specialty, status);
    ctx.body = { message: '技师更新成功' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '更新技师失败', error };
  }
};

export const removeTechnician = async (ctx: Context) => {
  const id = parseInt(ctx.params.id);

  const existingTechnician = getTechnicianById(id);
  if (!existingTechnician) {
    ctx.status = 404;
    ctx.body = { message: '技师不存在' };
    return;
  }

  try {
    deleteTechnician(id);
    ctx.body = { message: '技师删除成功' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '删除技师失败', error };
  }
};
