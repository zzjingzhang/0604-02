import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../database/car-repair.db');

type DatabaseInstance = InstanceType<typeof Database>;
const db: DatabaseInstance = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export { db };
export default db;
