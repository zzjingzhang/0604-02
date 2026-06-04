import request from '@/utils/request';

export const getActiveTechnicians = () => {
  return request.get('/technicians/active');
};

export const getAllTechnicians = () => {
  return request.get('/admin/technicians');
};

export const createTechnician = (data: any) => {
  return request.post('/admin/technicians', data);
};

export const updateTechnician = (id: number, data: any) => {
  return request.put(`/admin/technicians/${id}`, data);
};

export const deleteTechnician = (id: number) => {
  return request.delete(`/admin/technicians/${id}`);
};
