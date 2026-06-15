import db from '../config/database';
import {
  APPOINTMENT_STATUS,
  APPOINTMENT_TO_WORK_ORDER,
  isValidStatusTransition,
  VALID_APPOINTMENT_TRANSITIONS,
  WORK_ORDER_STATUS
} from '../utils/status';
import { getActiveTechnicians } from './Technician';
import { getServiceById } from './Service';

export interface Appointment {
  id: number;
  user_id: number;
  service_id: number;
  technician_id?: number | null;
  appointment_date: string;
  appointment_time: string;
  status: string;
  car_info?: string | null;
  description?: string | null;
  created_at: string;
  username?: string;
  service_name?: string;
  technician_name?: string;
  price?: number;
  duration?: number;
}

const assertAffectedRows = (result: any, expected: number, entity: string): void => {
  if (result.changes !== expected) {
    throw new Error(`事务失败：${entity} 预期影响 ${expected} 行，实际影响 ${result.changes} 行`);
  }
};

export const checkTimeConflict = (
  technicianId: number | null,
  date: string,
  time: string,
  duration: number,
  excludeId?: number
): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  const startTime = hours * 60 + minutes;
  const endTime = startTime + duration;

  let sql = `
    SELECT a.appointment_time, s.duration
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    WHERE a.appointment_date = ?
      AND a.status != ?
  `;

  const params: (string | number)[] = [date, APPOINTMENT_STATUS.CANCELLED];

  if (technicianId) {
    sql += ' AND a.technician_id = ?';
    params.push(technicianId);
  }

  if (excludeId) {
    sql += ' AND a.id != ?';
    params.push(excludeId);
  }

  const stmt = db.prepare(sql);
  const appointments = stmt.all(...params) as { appointment_time: string; duration: number }[];

  for (const appt of appointments) {
    const [apptHours, apptMinutes] = appt.appointment_time.split(':').map(Number);
    const apptStart = apptHours * 60 + apptMinutes;
    const apptEnd = apptStart + appt.duration;

    if (startTime < apptEnd && endTime > apptStart) {
      return true;
    }
  }

  return false;
};

export const findAvailableTechnician = (
  date: string,
  time: string,
  duration: number
): number | null => {
  const technicians = getActiveTechnicians();
  for (const tech of technicians) {
    if (!checkTimeConflict(tech.id, date, time, duration)) {
      return tech.id;
    }
  }
  return null;
};

export const createAppointmentWithOrder = (
  userId: number,
  serviceId: number,
  technicianId: number,
  date: string,
  time: string,
  carInfo?: string | null,
  description?: string | null
): { appointmentId: number; workOrderId: number } => {
  const createTransaction = db.transaction(() => {
    const insertAppointment = db.prepare(`
      INSERT INTO appointments (user_id, service_id, technician_id, appointment_date, appointment_time, car_info, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const appointmentResult = insertAppointment.run(
      userId,
      serviceId,
      technicianId,
      date,
      time,
      carInfo || null,
      description || null,
      APPOINTMENT_STATUS.PENDING
    );
    assertAffectedRows(appointmentResult, 1, `创建预约`);
    const appointmentId = appointmentResult.lastInsertRowid as number;

    const insertWorkOrder = db.prepare(`
      INSERT INTO work_orders (appointment_id, status)
      VALUES (?, ?)
    `);
    const workOrderResult = insertWorkOrder.run(
      appointmentId,
      WORK_ORDER_STATUS.WAITING
    );
    assertAffectedRows(workOrderResult, 1, `创建工单`);
    const workOrderId = workOrderResult.lastInsertRowid as number;

    return { appointmentId, workOrderId };
  });

  return createTransaction();
};

export const createAppointment = (
  userId: number,
  serviceId: number,
  technicianId: number | null,
  date: string,
  time: string,
  carInfo?: string,
  description?: string
): number => {
  const stmt = db.prepare(`
    INSERT INTO appointments (user_id, service_id, technician_id, appointment_date, appointment_time, car_info, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(userId, serviceId, technicianId, date, time, carInfo || null, description || null);
  return result.lastInsertRowid as number;
};

export const getAppointmentsByUserId = (userId: number): Appointment[] => {
  const stmt = db.prepare(`
    SELECT a.*, u.username, s.name as service_name, s.price, s.duration, t.name as technician_name
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    JOIN services s ON a.service_id = s.id
    LEFT JOIN technicians t ON a.technician_id = t.id
    WHERE a.user_id = ?
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `);
  return stmt.all(userId) as Appointment[];
};

export const getAppointmentById = (id: number): Appointment | undefined => {
  const stmt = db.prepare(`
    SELECT a.*, u.username, s.name as service_name, s.price, s.duration, t.name as technician_name
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    JOIN services s ON a.service_id = s.id
    LEFT JOIN technicians t ON a.technician_id = t.id
    WHERE a.id = ?
  `);
  return stmt.get(id) as Appointment | undefined;
};

export const getAllAppointments = (): Appointment[] => {
  const stmt = db.prepare(`
    SELECT a.*, u.username, s.name as service_name, s.price, s.duration, t.name as technician_name
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    JOIN services s ON a.service_id = s.id
    LEFT JOIN technicians t ON a.technician_id = t.id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `);
  return stmt.all() as Appointment[];
};

export const updateAppointmentStatus = (id: number, status: string): boolean => {
  const current = getAppointmentById(id);
  if (!current) return false;

  if (current.status === status) return true;

  if (!isValidStatusTransition(current.status, status, VALID_APPOINTMENT_TRANSITIONS)) {
    return false;
  }

  const updateAppt = db.prepare('UPDATE appointments SET status = ? WHERE id = ?');
  const updateWo = db.prepare('UPDATE work_orders SET status = ? WHERE appointment_id = ?');
  const updateWoWithEndTime = db.prepare(
    "UPDATE work_orders SET status = ?, end_time = CURRENT_TIMESTAMP WHERE appointment_id = ?"
  );

  try {
    const runTransaction = db.transaction(() => {
      const aptResult = updateAppt.run(status, id);
      assertAffectedRows(aptResult, 1, `预约#${id}`);

      const workOrderStatus = APPOINTMENT_TO_WORK_ORDER[status as keyof typeof APPOINTMENT_TO_WORK_ORDER];

      if (workOrderStatus) {
        let woResult;
        if (status === APPOINTMENT_STATUS.COMPLETED) {
          woResult = updateWoWithEndTime.run(workOrderStatus, id);
        } else {
          woResult = updateWo.run(workOrderStatus, id);
        }
        assertAffectedRows(woResult, 1, `工单（关联预约#${id}）`);
      }
    });

    runTransaction();
    return true;
  } catch (error) {
    return false;
  }
};

export const updateAppointmentTechnician = (id: number, technicianId: number): void => {
  const stmt = db.prepare('UPDATE appointments SET technician_id = ? WHERE id = ?');
  stmt.run(technicianId, id);
};

export const getAppointmentsByDate = (date: string): Appointment[] => {
  const stmt = db.prepare(`
    SELECT a.*, u.username, s.name as service_name, s.price, s.duration, t.name as technician_name
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    JOIN services s ON a.service_id = s.id
    LEFT JOIN technicians t ON a.technician_id = t.id
    WHERE a.appointment_date = ? AND a.status != ?
    ORDER BY a.appointment_time
  `);
  return stmt.all(date, APPOINTMENT_STATUS.CANCELLED) as Appointment[];
};

export const getAppointmentsByDateAndTechnician = (
  date: string,
  technicianId: number
): Appointment[] => {
  const stmt = db.prepare(`
    SELECT a.*, u.username, s.name as service_name, s.price, s.duration, t.name as technician_name
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    JOIN services s ON a.service_id = s.id
    LEFT JOIN technicians t ON a.technician_id = t.id
    WHERE a.appointment_date = ? AND a.technician_id = ? AND a.status != ?
    ORDER BY a.appointment_time
  `);
  return stmt.all(date, technicianId, APPOINTMENT_STATUS.CANCELLED) as Appointment[];
};

export const getAppointmentsWithoutTechnician = (date: string): Appointment[] => {
  const stmt = db.prepare(`
    SELECT a.*, u.username, s.name as service_name, s.price, s.duration
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    JOIN services s ON a.service_id = s.id
    WHERE a.appointment_date = ? AND a.technician_id IS NULL AND a.status != ?
    ORDER BY a.appointment_time
  `);
  return stmt.all(date, APPOINTMENT_STATUS.CANCELLED) as Appointment[];
};

export const assignTechnicianWithConflictCheck = (
  appointmentId: number,
  technicianId: number
): { success: boolean; message: string } => {
  const appointment = getAppointmentById(appointmentId);
  if (!appointment) {
    return { success: false, message: '预约不存在' };
  }

  if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
    return { success: false, message: '已取消的预约无法分配技师' };
  }

  const service = getServiceById(appointment.service_id);
  if (!service) {
    return { success: false, message: '关联的服务项目不存在' };
  }

  const hasConflict = checkTimeConflict(
    technicianId,
    appointment.appointment_date,
    appointment.appointment_time,
    service.duration,
    appointmentId
  );

  if (hasConflict) {
    return { success: false, message: '该技师在此时段已有其他预约，存在时间冲突' };
  }

  try {
    const runTransaction = db.transaction(() => {
      const updateStmt = db.prepare('UPDATE appointments SET technician_id = ? WHERE id = ?');
      const result = updateStmt.run(technicianId, appointmentId);
      assertAffectedRows(result, 1, `分配技师到预约#${appointmentId}`);
    });
    runTransaction();
    return { success: true, message: '技师分配成功' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : '分配失败' };
  }
};
