import db from '../config/database';
import bcrypt from 'bcryptjs';

const initDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'customer',
      phone VARCHAR(20),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      duration INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS technicians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(50) NOT NULL,
      phone VARCHAR(20),
      specialty VARCHAR(100),
      status VARCHAR(20) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      technician_id INTEGER,
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      car_info TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (service_id) REFERENCES services(id),
      FOREIGN KEY (technician_id) REFERENCES technicians(id)
    );

    CREATE TABLE IF NOT EXISTS work_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id INTEGER NOT NULL,
      status VARCHAR(20) DEFAULT 'waiting',
      progress TEXT,
      start_time DATETIME,
      end_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id)
    );
  `);

  const hashedPassword = bcrypt.hashSync('123456', 10);

  const checkAdmin = db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?');
  const adminResult = checkAdmin.get('admin@example.com') as { count: number };
  
  if (adminResult.count === 0) {
    const insertAdmin = db.prepare(`
      INSERT INTO users (username, email, password, role, phone)
      VALUES (?, ?, ?, 'admin', ?)
    `);
    insertAdmin.run('管理员', 'admin@example.com', hashedPassword, '13800138000');
  }

  const checkCustomer = db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?');
  const customerResult = checkCustomer.get('customer@example.com') as { count: number };
  
  if (customerResult.count === 0) {
    const insertCustomer = db.prepare(`
      INSERT INTO users (username, email, password, role, phone)
      VALUES (?, ?, ?, 'customer', ?)
    `);
    insertCustomer.run('张三', 'customer@example.com', hashedPassword, '13900139000');
  }

  const checkServices = db.prepare('SELECT COUNT(*) as count FROM services');
  const servicesResult = checkServices.get() as { count: number };
  
  if (servicesResult.count === 0) {
    const insertService = db.prepare(`
      INSERT INTO services (name, description, price, duration)
      VALUES (?, ?, ?, ?)
    `);
    
    const services = [
      ['常规保养', '更换机油、机滤、空滤，全车检查', 399.00, 60],
      ['刹车片更换', '前后刹车片更换及制动系统检查', 599.00, 90],
      ['轮胎更换', '轮胎更换及动平衡', 800.00, 60],
      ['发动机检修', '发动机故障诊断与维修', 299.00, 120],
      ['空调系统维修', '空调清洗、加氟、故障排查', 350.00, 90],
      ['钣金喷漆', '车身钣金修复及喷漆服务', 500.00, 180]
    ];
    
    services.forEach(([name, description, price, duration]) => {
      insertService.run(name, description, price, duration);
    });
  }

  const checkTechnicians = db.prepare('SELECT COUNT(*) as count FROM technicians');
  const techniciansResult = checkTechnicians.get() as { count: number };
  
  if (techniciansResult.count === 0) {
    const insertTechnician = db.prepare(`
      INSERT INTO technicians (name, phone, specialty, status)
      VALUES (?, ?, ?, 'active')
    `);
    
    const technicians = [
      ['李师傅', '13700137001', '发动机维修专家'],
      ['王师傅', '13700137002', '底盘与制动系统'],
      ['张师傅', '13700137003', '电气系统与空调'],
      ['赵师傅', '13700137004', '钣金喷漆专家']
    ];
    
    technicians.forEach(([name, phone, specialty]) => {
      insertTechnician.run(name, phone, specialty);
    });
  }

  console.log('数据库初始化完成！');
  console.log('默认测试账号：');
  console.log('商家账号：admin@example.com / 123456');
  console.log('顾客账号：customer@example.com / 123456');
};

initDatabase();
