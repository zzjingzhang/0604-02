import { Context } from 'koa';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../models/Service';

export const getServices = async (ctx: Context) => {
  const services = getAllServices();
  ctx.body = { services };
};

export const getService = async (ctx: Context) => {
  const id = parseInt(ctx.params.id);
  const service = getServiceById(id);

  if (!service) {
    ctx.status = 404;
    ctx.body = { message: '服务项目不存在' };
    return;
  }

  ctx.body = { service };
};

export const addService = async (ctx: Context) => {
  const { name, description, price, duration } = ctx.request.body as {
    name: string;
    description: string;
    price: number;
    duration: number;
  };

  if (!name || !price || !duration) {
    ctx.status = 400;
    ctx.body = { message: '服务名称、价格和时长不能为空' };
    return;
  }

  try {
    const id = createService(name, description, price, duration);
    ctx.status = 201;
    ctx.body = { message: '服务项目创建成功', id };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '创建服务项目失败', error };
  }
};

export const editService = async (ctx: Context) => {
  const id = parseInt(ctx.params.id);
  const { name, description, price, duration } = ctx.request.body as {
    name: string;
    description: string;
    price: number;
    duration: number;
  };

  const existingService = getServiceById(id);
  if (!existingService) {
    ctx.status = 404;
    ctx.body = { message: '服务项目不存在' };
    return;
  }

  try {
    updateService(id, name, description, price, duration);
    ctx.body = { message: '服务项目更新成功' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '更新服务项目失败', error };
  }
};

export const removeService = async (ctx: Context) => {
  const id = parseInt(ctx.params.id);

  const existingService = getServiceById(id);
  if (!existingService) {
    ctx.status = 404;
    ctx.body = { message: '服务项目不存在' };
    return;
  }

  try {
    deleteService(id);
    ctx.body = { message: '服务项目删除成功' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '删除服务项目失败', error };
  }
};
