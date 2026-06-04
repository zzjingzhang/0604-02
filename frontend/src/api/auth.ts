import request from '@/utils/request';

export const login = (data: { email: string; password: string }) => {
  return request.post('/auth/login', data);
};

export const register = (data: { username: string; email: string; password: string; phone?: string; role?: string }) => {
  return request.post('/auth/register', data);
};

export const getProfile = () => {
  return request.get('/auth/profile');
};
