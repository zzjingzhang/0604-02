import db from '../config/database';

export interface WorkOrder {
  id: number;
  appointment_id: number;
  status: string;
  progress?: string;
  start_time?: string;
  end_time?: string;
  created_at: string;
  username?: string;
  service_name?: string;
  technician_name?: string;
  appointment_date?: string;
  appointment_time?: string;
}

export const createWorkOrder = (appointmentId: number): number => {
  const stmt = db.prepare(`
    INSERT INTO work_orders (appointment_id)
    VALUES (?)
  `);
  const result = stmt.run(appointmentId);
  return result.lastInsertRowid as number;
};

export const getWorkOrderById = (id: number): WorkOrder | undefined => {
  const stmt = db.prepare(`
    SELECT w.*, a.appointment_date, a.appointment_time, u.username, s.name as service_name, t.name as technician_name
    FROM work_orders w
    JOIN appointments a ON w.appointment_id = a.id
    JOIN users u ON a.user_id = u.id
    JOIN services s ON a.service_id = s.id
    LEFT JOIN technicians t ON a.technician_id = t.id
    WHERE w.id = ?
  `);
  return stmt.get(id) as WorkOrder | undefined;
};

export const getWorkOrderByAppointmentId = (appointmentId: number): WorkOrder | undefined => {
  const stmt = db.prepare(`
    SELECT w.*, a.appointment_date, a.appointment_time, u.username, s.name as service_name, t.name as technician_name
    FROM work_orders w
    JOIN appointments a ON w.appointment_id = a.id
    JOIN users u ON a.user_id = u.id
    JOIN services s ON a.service_id = s.id
    LEFT JOIN technicians t ON a.technician_id = t.id
    WHERE w.appointment_id = ?
  `);
  return stmt.get(appointmentId) as WorkOrder | undefined;
};

export const getAllWorkOrders = (): WorkOrder[] => {
  const stmt = db.prepare(`
    SELECT w.*, a.appointment_date, a.appointment_time, u.username, s.name as service_name, t.name as technician_name
    FROM work_orders w
    JOIN appointments a ON w.appointment_id = a.id
    JOIN users u ON a.user_id = u.id
    JOIN services s ON a.service_id = s.id
    LEFT JOIN technicians t ON a.technician_id = t.id
    ORDER BY w.created_at DESC
  `);
  return stmt.all() as WorkOrder[];
};

export const updateWorkOrderStatus = (id: number, status: string, progress?: string): void => {
  const stmt = db.prepare(`
    UPDATE work_orders SET status = ?, progress = ?
    WHERE id = ?
  `);
  stmt.run(status, progress || null, id);
};

export const startWorkOrder = (id: number): void => {
  const stmt = db.prepare(`
    UPDATE work_orders SET status = 'in_progress', start_time = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(id);
};

export const completeWorkOrder = (id: number): void => {
  const stmt = db.prepare(`
    UPDATE work_orders SET status = 'completed', end_time = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(id);
};

export const getWorkOrdersByUserId = (userId: number): WorkOrder[] => {
  const stmt = db.prepare(`
    SELECT w.*, a.appointment_date, a.appointment_time, u.username, s.name as service_name, t.name as technician_name
    FROM work_orders w
    JOIN appointments a ON w.appointment_id = a.id
    JOIN users u ON a.user_id = u.id
    JOIN services s ON a.service_id = s.id
    LEFT JOIN technicians t ON a.technician_id = t.id
    WHERE a.user_id = ?
    ORDER BY w.created_at DESC
  `);
  return stmt.all(userId) as WorkOrder[];
};
