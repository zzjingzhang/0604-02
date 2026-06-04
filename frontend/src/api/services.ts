import request from '@/utils/request';

export const getServices = () => {
  return request.get('/services');
};

export const getService = (id: number) => {
  return request.get(`/services/${id}`);
};

export const getAdminServices = () => {
  return request.get('/admin/services');
};

export const createService = (data: any) => {
  return request.post('/admin/services', data);
};

export const updateService = (id: number, data: any) => {
  return request.put(`/admin/services/${id}`, data);
};

export const deleteService = (id: number) => {
  return request.delete(`/admin/services/${id}`);
};
