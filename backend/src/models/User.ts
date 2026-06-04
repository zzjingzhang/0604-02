import db from '../config/database';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  created_at: string;
}

export const findUserByEmail = (email: string): User | undefined => {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
};

export const findUserById = (id: number): User | undefined => {
  const stmt = db.prepare('SELECT id, username, email, role, phone, created_at FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
};

export const createUser = (username: string, email: string, password: string, role: string = 'customer', phone?: string): number => {
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password, role, phone)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(username, email, password, role, phone);
  return result.lastInsertRowid as number;
};
