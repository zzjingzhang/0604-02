import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', '..', 'database', 'car-repair.db');
const db = new Database(dbPath);

const APPOINTMENT_TO_WORK_ORDER: Record<string, string> = {
  pending: 'waiting',
  confirmed: 'waiting',
  processing: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled'
};

const VALID_APPOINTMENT_FOR_WORK_ORDER: Record<string, string[]> = {
  waiting: ['pending', 'confirmed'],
  in_progress: ['processing'],
  completed: ['completed'],
  cancelled: ['cancelled']
};

const DEFAULT_APPOINTMENT_FOR_WORK_ORDER: Record<string, string> = {
  waiting: 'confirmed',
  in_progress: 'processing',
  completed: 'completed',
  cancelled: 'cancelled'
};

console.log('='.repeat(60));
console.log('汽车维修预约系统 - 数据一致性修复脚本');
console.log('='.repeat(60));
console.log('');
console.log('修复规则：');
console.log('  1. 工单状态优先（更能反映实际维修结果）');
console.log('  2. 工单 waiting    → 预约 pending 或 confirmed（均视为一致，不修改）');
console.log('  3. 工单 in_progress → 预约 processing');
console.log('  4. 工单 completed   → 预约 completed');
console.log('  5. 工单 cancelled   → 预约 cancelled');
console.log('  6. 检查并修复工单缺失（预约存在但工单不存在）');
console.log('     - 预约 pending/confirmed → 创建 waiting 工单');
console.log('     - 预约 processing → 创建 in_progress 工单');
console.log('     - 预约 completed → 创建 completed 工单');
console.log('     - 预约 cancelled → 创建 cancelled 工单');
console.log('  7. 可重复执行，不会重复破坏数据（幂等）');
console.log('');

interface AppointmentRow {
  id: number;
  status: string;
  user_id: number;
  service_id: number;
}

interface WorkOrderRow {
  id: number;
  appointment_id: number;
  status: string;
}

console.log('扫描数据中...');
console.log('');

const appointments = db.prepare(`
  SELECT id, status, user_id, service_id FROM appointments
`).all() as AppointmentRow[];

const workOrders = db.prepare(`
  SELECT id, appointment_id, status FROM work_orders
`).all() as WorkOrderRow[];

const woByAptId = new Map<number, WorkOrderRow>();
for (const wo of workOrders) {
  woByAptId.set(wo.appointment_id, wo);
}

let fixedCount = 0;
let createdWOCount = 0;
let skippedCount = 0;
let errorCount = 0;
let consistentCount = 0;

const updateAptStmt = db.prepare('UPDATE appointments SET status = ? WHERE id = ?');
const insertWOStmt = db.prepare(`
  INSERT INTO work_orders (appointment_id, status, progress)
  VALUES (?, ?, NULL)
`);

for (const apt of appointments) {
  const wo = woByAptId.get(apt.id);

  if (!wo) {
    console.log(`⚠️  预约#${apt.id}（状态=${apt.status}）没有对应工单，正在创建...`);
    const expectedWOStatus = APPOINTMENT_TO_WORK_ORDER[apt.status] || 'waiting';
    try {
      const tx = db.transaction(() => {
        insertWOStmt.run(apt.id, expectedWOStatus);
      });
      tx();
      createdWOCount++;
      console.log(`   ✅ 已创建工单，状态: ${expectedWOStatus}`);
    } catch (e) {
      errorCount++;
      console.log(`   ❌ 创建失败: ${e instanceof Error ? e.message : String(e)}`);
    }
    continue;
  }

  const validAptStatuses = VALID_APPOINTMENT_FOR_WORK_ORDER[wo.status];

  if (!validAptStatuses) {
    console.log(`⚠️  工单#${wo.id} 状态「${wo.status}」无映射规则，跳过`);
    skippedCount++;
    continue;
  }

  if (validAptStatuses.includes(apt.status)) {
    consistentCount++;
    console.log(`✅ 预约#${apt.id} 状态一致 (预约=${apt.status}, 工单=${wo.status})`);
    continue;
  }

  const expectedAptStatus = DEFAULT_APPOINTMENT_FOR_WORK_ORDER[wo.status];
  console.log(
    `⚠️  预约#${apt.id} 状态不一致: 预约=${apt.status}, ` +
    `工单=${wo.status} → 应修正为 ${expectedAptStatus}`
  );
  try {
    const tx = db.transaction(() => {
      const result = updateAptStmt.run(expectedAptStatus, apt.id);
      if (result.changes !== 1) {
        throw new Error(`更新失败，影响行数: ${result.changes}`);
      }
    });
    tx();
    fixedCount++;
    console.log(`   ✅ 已修正`);
  } catch (e) {
    errorCount++;
    console.log(`   ❌ 修正失败: ${e instanceof Error ? e.message : String(e)}`);
  }
}

console.log('');
console.log('='.repeat(60));
console.log('修复结果统计:');
console.log(`  总预约数: ${appointments.length}`);
console.log(`  状态一致: ${consistentCount}`);
console.log(`  状态已修正: ${fixedCount}`);
console.log(`  新建缺失工单: ${createdWOCount}`);
console.log(`  跳过（无映射规则）: ${skippedCount}`);
console.log(`  错误: ${errorCount}`);
console.log('='.repeat(60));

db.close();
process.exit(errorCount > 0 ? 1 : 0);
