import { Context } from 'koa';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser, findUserById } from '../models/User';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt';

export const register = async (ctx: Context) => {
  const { username, email, password, phone, role } = ctx.request.body as {
    username: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  };

  if (!username || !email || !password) {
    ctx.status = 400;
    ctx.body = { message: '用户名、邮箱和密码不能为空' };
    return;
  }

  const existingUser = findUserByEmail(email);
  if (existingUser) {
    ctx.status = 400;
    ctx.body = { message: '该邮箱已被注册' };
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userRole = role === 'admin' ? 'admin' : 'customer';

  try {
    const userId = createUser(username, email, hashedPassword, userRole, phone);
    const user = findUserById(userId);

    const token = jwt.sign(
      { id: userId, username, email, role: userRole },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    ctx.status = 201;
    ctx.body = {
      message: '注册成功',
      token,
      user: {
        id: userId,
        username,
        email,
        role: userRole,
        phone
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: '注册失败', error };
  }
};

export const login = async (ctx: Context) => {
  const { email, password } = ctx.request.body as {
    email: string;
    password: string;
  };

  if (!email || !password) {
    ctx.status = 400;
    ctx.body = { message: '邮箱和密码不能为空' };
    return;
  }

  const user = findUserByEmail(email);
  if (!user) {
    ctx.status = 401;
    ctx.body = { message: '邮箱或密码错误' };
    return;
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    ctx.status = 401;
    ctx.body = { message: '邮箱或密码错误' };
    return;
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  ctx.body = {
    message: '登录成功',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone
    }
  };
};

export const getProfile = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  const user = findUserById(userId);

  if (!user) {
    ctx.status = 404;
    ctx.body = { message: '用户不存在' };
    return;
  }

  ctx.body = { user };
};
