import db from '../config/database';
import {
  WORK_ORDER_STATUS,
  WORK_ORDER_TO_APPOINTMENT,
  APPOINTMENT_STATUS,
  isValidStatusTransition,
  VALID_WORK_ORDER_TRANSITIONS
} from '../utils/status';

export interface WorkOrder {
  id: number;
  appointment_id: number;
  status: string;
  progress?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  created_at: string;
  username?: string;
  service_name?: string;
  technician_name?: string;
  appointment_date?: string;
  appointment_time?: string;
}

export const createWorkOrder = (appointmentId: number): number => {
  const stmt = db.prepare(`
    INSERT INTO work_orders (appointment_id, status)
    VALUES (?, ?)
  `);
  const result = stmt.run(appointmentId, WORK_ORDER_STATUS.WAITING);
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

export const updateWorkOrderStatus = (
  id: number,
  status: string,
  progress?: string
): boolean => {
  const current = getWorkOrderById(id);
  if (!current) return false;

  if (current.status === status) return true;

  if (!isValidStatusTransition(current.status, status, VALID_WORK_ORDER_TRANSITIONS)) {
    return false;
  }

  const appointmentStatus = WORK_ORDER_TO_APPOINTMENT[status as keyof typeof WORK_ORDER_TO_APPOINTMENT];

  const runTransaction = db.transaction(() => {
    const updateWo = db.prepare(
      'UPDATE work_orders SET status = ?, progress = ? WHERE id = ?'
    );
    updateWo.run(status, progress || null, id);

    if (appointmentStatus) {
      const updateApt = db.prepare(
        'UPDATE appointments SET status = ? WHERE id = ?'
      );
      updateApt.run(appointmentStatus, current.appointment_id);
    }
  });

  runTransaction();
  return true;
};

export const startWorkOrder = (id: number): boolean => {
  const current = getWorkOrderById(id);
  if (!current) return false;

  if (current.status === WORK_ORDER_STATUS.IN_PROGRESS) return true;

  if (!isValidStatusTransition(current.status, WORK_ORDER_STATUS.IN_PROGRESS, VALID_WORK_ORDER_TRANSITIONS)) {
    return false;
  }

  const runTransaction = db.transaction(() => {
    const updateWo = db.prepare(`
      UPDATE work_orders SET status = ?, start_time = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    updateWo.run(WORK_ORDER_STATUS.IN_PROGRESS, id);

    const updateApt = db.prepare(
      'UPDATE appointments SET status = ? WHERE id = ?'
    );
    updateApt.run(APPOINTMENT_STATUS.PROCESSING, current.appointment_id);
  });

  runTransaction();
  return true;
};

export const completeWorkOrder = (id: number): boolean => {
  const current = getWorkOrderById(id);
  if (!current) return false;

  if (current.status === WORK_ORDER_STATUS.COMPLETED) return true;

  if (!isValidStatusTransition(current.status, WORK_ORDER_STATUS.COMPLETED, VALID_WORK_ORDER_TRANSITIONS)) {
    return false;
  }

  const runTransaction = db.transaction(() => {
    const updateWo = db.prepare(`
      UPDATE work_orders SET status = ?, end_time = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    updateWo.run(WORK_ORDER_STATUS.COMPLETED, id);

    const updateApt = db.prepare(
      'UPDATE appointments SET status = ? WHERE id = ?'
    );
    updateApt.run(APPOINTMENT_STATUS.COMPLETED, current.appointment_id);
  });

  runTransaction();
  return true;
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
