import db from '../config/database';

export interface Technician {
  id: number;
  name: string;
  phone: string;
  specialty: string;
  status: string;
  created_at: string;
}

export const getAllTechnicians = (): Technician[] => {
  const stmt = db.prepare('SELECT * FROM technicians ORDER BY id');
  return stmt.all() as Technician[];
};

export const getActiveTechnicians = (): Technician[] => {
  const stmt = db.prepare("SELECT * FROM technicians WHERE status = 'active' ORDER BY id");
  return stmt.all() as Technician[];
};

export const getTechnicianById = (id: number): Technician | undefined => {
  const stmt = db.prepare('SELECT * FROM technicians WHERE id = ?');
  return stmt.get(id) as Technician | undefined;
};

export const createTechnician = (name: string, phone: string, specialty: string): number => {
  const stmt = db.prepare(`
    INSERT INTO technicians (name, phone, specialty)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(name, phone, specialty);
  return result.lastInsertRowid as number;
};

export const updateTechnician = (id: number, name: string, phone: string, specialty: string, status: string): void => {
  const stmt = db.prepare(`
    UPDATE technicians SET name = ?, phone = ?, specialty = ?, status = ?
    WHERE id = ?
  `);
  stmt.run(name, phone, specialty, status, id);
};

export const deleteTechnician = (id: number): void => {
  const stmt = db.prepare('DELETE FROM technicians WHERE id = ?');
  stmt.run(id);
};
