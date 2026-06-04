import request from '@/utils/request';

export const getMyWorkOrders = () => {
  return request.get('/work-orders/my');
};

export const getWorkOrder = (id: number) => {
  return request.get(`/work-orders/${id}`);
};

export const getWorkOrderByAppointment = (appointmentId: number) => {
  return request.get(`/work-orders/appointment/${appointmentId}`);
};

export const getAllWorkOrders = () => {
  return request.get('/admin/work-orders');
};

export const updateWorkOrderStatus = (id: number, status: string, progress?: string) => {
  return request.put(`/admin/work-orders/${id}/status`, { status, progress });
};

export const startWorkOrder = (id: number) => {
  return request.put(`/admin/work-orders/${id}/start`);
};

export const completeWorkOrder = (id: number) => {
  return request.put(`/admin/work-orders/${id}/complete`);
};
