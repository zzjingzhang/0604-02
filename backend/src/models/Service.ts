import db from '../config/database';

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  created_at: string;
}

export const getAllServices = (): Service[] => {
  const stmt = db.prepare('SELECT * FROM services ORDER BY id');
  return stmt.all() as Service[];
};

export const getServiceById = (id: number): Service | undefined => {
  const stmt = db.prepare('SELECT * FROM services WHERE id = ?');
  return stmt.get(id) as Service | undefined;
};

export const createService = (name: string, description: string, price: number, duration: number): number => {
  const stmt = db.prepare(`
    INSERT INTO services (name, description, price, duration)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(name, description, price, duration);
  return result.lastInsertRowid as number;
};

export const updateService = (id: number, name: string, description: string, price: number, duration: number): void => {
  const stmt = db.prepare(`
    UPDATE services SET name = ?, description = ?, price = ?, duration = ?
    WHERE id = ?
  `);
  stmt.run(name, description, price, duration, id);
};

export const deleteService = (id: number): void => {
  const stmt = db.prepare('DELETE FROM services WHERE id = ?');
  stmt.run(id);
};
