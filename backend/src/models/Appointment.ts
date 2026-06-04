import db from '../config/database';

export interface Appointment {
  id: number;
  user_id: number;
  service_id: number;
  technician_id?: number;
  appointment_date: string;
  appointment_time: string;
  status: string;
  car_info?: string;
  description?: string;
  created_at: string;
  username?: string;
  service_name?: string;
  technician_name?: string;
  price?: number;
  duration?: number;
}

export const checkTimeConflict = (technicianId: number | null, date: string, time: string, duration: number, excludeId?: number): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  const startTime = hours * 60 + minutes;
  const endTime = startTime + duration;

  let sql = `
    SELECT a.appointment_time, s.duration
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    WHERE a.appointment_date = ?
      AND a.status != 'cancelled'
  `;

  const params: (string | number)[] = [date];

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

export const updateAppointmentStatus = (id: number, status: string): void => {
  const stmt = db.prepare('UPDATE appointments SET status = ? WHERE id = ?');
  stmt.run(status, id);
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
    WHERE a.appointment_date = ? AND a.status != 'cancelled'
    ORDER BY a.appointment_time
  `);
  return stmt.all(date) as Appointment[];
};
