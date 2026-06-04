import request from '@/utils/request';

export const createAppointment = (data: any) => {
  return request.post('/appointments', data);
};

export const getMyAppointments = () => {
  return request.get('/appointments/my');
};

export const getAppointment = (id: number) => {
  return request.get(`/appointments/${id}`);
};

export const checkConflict = (data: any) => {
  return request.post('/appointments/check-conflict', data);
};

export const getAllAppointments = () => {
  return request.get('/admin/appointments');
};

export const getScheduleByDate = (date: string) => {
  return request.get(`/admin/appointments/schedule/${date}`);
};

export const updateAppointmentStatus = (id: number, status: string) => {
  return request.put(`/admin/appointments/${id}/status`, { status });
};

export const assignTechnician = (id: number, technicianId: number) => {
  return request.put(`/admin/appointments/${id}/technician`, { technicianId });
};
