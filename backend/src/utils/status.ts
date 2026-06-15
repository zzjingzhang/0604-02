export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

export const APPOINTMENT_STATUS_TEXT: Record<AppointmentStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  processing: '维修中',
  completed: '已完成',
  cancelled: '已取消'
};

export const WORK_ORDER_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type WorkOrderStatus = typeof WORK_ORDER_STATUS[keyof typeof WORK_ORDER_STATUS];

export const WORK_ORDER_STATUS_TEXT: Record<WorkOrderStatus, string> = {
  waiting: '等待维修',
  in_progress: '维修中',
  completed: '已完成',
  cancelled: '已取消'
};

export const APPOINTMENT_TO_WORK_ORDER: Record<AppointmentStatus, WorkOrderStatus> = {
  pending: 'waiting',
  confirmed: 'waiting',
  processing: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled'
};

export const WORK_ORDER_TO_APPOINTMENT: Record<WorkOrderStatus, AppointmentStatus | null> = {
  waiting: null,
  in_progress: 'processing',
  completed: 'completed',
  cancelled: 'cancelled'
};

export const VALID_APPOINTMENT_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['completed'],
  completed: [],
  cancelled: []
};

export const VALID_WORK_ORDER_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  waiting: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed: [],
  cancelled: []
};

export const BUSINESS_HOURS = {
  START_MINUTES: 9 * 60,
  END_MINUTES: 18 * 60,
  SLOT_MINUTES: 30
};

export const isValidStatusTransition = (
  currentStatus: string,
  targetStatus: string,
  validTransitions: Record<string, string[]>,
  allowSameState: boolean = true
): boolean => {
  if (allowSameState && currentStatus === targetStatus) {
    return true;
  }
  const allowed = validTransitions[currentStatus];
  if (!allowed) return false;
  return allowed.includes(targetStatus);
};

export const isValidTimeFormat = (time: string): boolean => {
  if (!/^\d{2}:\d{2}$/.test(time)) return false;
  const [hours, minutes] = time.split(':').map(Number);
  if (hours < 0 || hours > 23) return false;
  if (minutes < 0 || minutes > 59) return false;
  return true;
};

export const isValidDateFormat = (dateStr: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  return date.toISOString().slice(0, 10) === dateStr;
};

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const isValidTimeSlot = (time: string, slotMinutes: number = BUSINESS_HOURS.SLOT_MINUTES): boolean => {
  if (!isValidTimeFormat(time)) return false;
  const [, minutes] = time.split(':').map(Number);
  return minutes % slotMinutes === 0;
};

export const isWithinBusinessHours = (startTime: string, durationMinutes: number): boolean => {
  const startMin = timeToMinutes(startTime);
  const endMin = startMin + durationMinutes;

  if (startMin < BUSINESS_HOURS.START_MINUTES) return false;
  if (endMin > BUSINESS_HOURS.END_MINUTES) return false;

  return true;
};
