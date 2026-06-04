import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt';

export interface UserPayload {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const authMiddleware = async (ctx: Context, next: Next) => {
  const authHeader = ctx.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { message: '未提供认证令牌' };
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    ctx.state.user = decoded;
    await next();
  } catch (error) {
    ctx.status = 401;
    ctx.body = { message: '无效的认证令牌' };
  }
};

export const adminMiddleware = async (ctx: Context, next: Next) => {
  if (!ctx.state.user || ctx.state.user.role !== 'admin') {
    ctx.status = 403;
    ctx.body = { message: '需要管理员权限' };
    return;
  }
  await next();
};
