<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">预约排期</h1>
      <div class="flex items-center space-x-4">
        <button
          @click="prevDay"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          上一天
        </button>
        <input
          v-model="selectedDate"
          type="date"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          @change="fetchData"
        />
        <button
          @click="nextDay"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          下一天
        </button>
      </div>
    </div>

    <div v-if="unassignedAppointments.length > 0" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
      <h3 class="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
        <span class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
        待分配技师 ({{ unassignedAppointments.length }} 个)
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="apt in unassignedAppointments"
          :key="apt.id"
          class="bg-white border border-yellow-300 rounded-lg p-3 text-sm"
        >
          <div class="flex justify-between items-start">
            <div class="font-medium text-gray-800">{{ apt.service_name }}</div>
            <span
              class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
            >
              {{ getStatusText(apt.status) }}
            </span>
          </div>
          <div class="text-gray-600 mt-1">顾客: {{ apt.username }}</div>
          <div class="text-gray-600">时间: {{ apt.appointment_time }}</div>
          <div class="text-gray-600">时长: {{ apt.duration }} 分钟</div>
        </div>
      </div>
    </div>

    <div v-if="abnormalAppointments.length > 0" class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
      <h3 class="text-lg font-semibold text-red-800 mb-3 flex items-center">
        <span class="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
        异常预约 ({{ abnormalAppointments.length }} 个)
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="apt in abnormalAppointments"
          :key="apt.id"
          class="bg-white border-2 border-dashed border-red-300 rounded-lg p-3 text-sm"
        >
          <div class="flex justify-between items-start">
            <div class="font-medium text-gray-800">{{ apt.service_name }}</div>
            <span
              class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
            >
              异常
            </span>
          </div>
          <div class="text-gray-600 mt-1">顾客: {{ apt.username }}</div>
          <div class="text-gray-600">预约时间: {{ apt.appointment_time }}</div>
          <div class="text-gray-600">时长: {{ apt.duration }} 分钟</div>
          <div class="text-gray-600">技师: {{ apt.technician_name || '未分配' }}</div>
          <div class="mt-2 pt-2 border-t border-red-100">
            <span class="text-xs font-medium text-red-600">异常原因:</span>
            <span class="text-xs text-red-700 ml-1">{{ apt.abnormalReason }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-md p-6 overflow-x-auto">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ selectedDate }} 技师排期表</h3>

      <div
        class="min-w-max grid gap-px bg-gray-200"
        :style="gridStyle"
      >
        <div
          v-for="header in headerCells"
          :key="header.key"
          class="bg-gray-50 p-3 font-medium text-center text-sm"
          :class="{ 'sticky left-0 z-20': header.isTime }"
        >
          <template v-if="header.isTime">{{ header.label }}</template>
          <template v-else>
            <div>{{ header.label }}</div>
            <div class="text-xs text-gray-400 font-normal">{{ header.subLabel }}</div>
          </template>
        </div>

        <template v-for="slotIndex in timeSlots.length" :key="'row-' + slotIndex">
          <div
            class="bg-gray-50 p-2 text-xs text-gray-500 text-right pr-3 sticky left-0 z-10"
            :class="{ 'bg-gray-100': slotIndex % 2 === 1 }"
          >
            {{ timeSlots[slotIndex - 1] }}
          </div>

          <div
            v-for="tech in technicians"
            :key="'cell-' + tech.id + '-' + slotIndex"
            class="relative"
            :class="{ 'bg-gray-50/50': slotIndex % 2 === 1 }"
          >
            <template v-for="apt in getAppointmentsAtSlot(tech.id, slotIndex - 1)" :key="apt.id">
              <div
                v-if="apt.isStart"
                class="absolute inset-1 rounded-md p-1.5 text-xs text-white z-10 overflow-hidden flex flex-col"
                :class="[
                  getStatusBgClass(apt.status),
                  apt.hasConflict ? 'ring-2 ring-red-400 ring-offset-1' : ''
                ]"
                :style="getAppointmentStyle(apt)"
              >
                <div class="flex justify-between items-start">
                  <span class="font-medium truncate">{{ apt.service_name }}</span>
                  <span v-if="apt.hasConflict" class="ml-1 text-red-200 text-[10px]">⚠</span>
                </div>
                <div class="opacity-90 truncate">{{ apt.username }}</div>
                <div class="opacity-75 text-[10px] mt-auto">
                  {{ getStatusText(apt.status) }}
                  <span v-if="apt.hasConflict" class="ml-1 text-red-200">（冲突）</span>
                </div>
                <div
                  v-if="apt.conflictCount > 0"
                  class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                >
                  {{ apt.conflictCount + 1 }}
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>

    <div class="mt-6 bg-white rounded-xl shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">状态图例</h3>
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center">
          <span class="w-4 h-4 rounded bg-yellow-500 mr-2"></span>
          <span class="text-sm text-gray-600">待确认</span>
        </div>
        <div class="flex items-center">
          <span class="w-4 h-4 rounded bg-blue-500 mr-2"></span>
          <span class="text-sm text-gray-600">已确认</span>
        </div>
        <div class="flex items-center">
          <span class="w-4 h-4 rounded bg-green-500 mr-2"></span>
          <span class="text-sm text-gray-600">维修中</span>
        </div>
        <div class="flex items-center">
          <span class="w-4 h-4 rounded bg-gray-500 mr-2"></span>
          <span class="text-sm text-gray-600">已完成</span>
        </div>
        <div class="flex items-center">
          <span class="w-4 h-4 rounded bg-red-500 mr-2"></span>
          <span class="text-sm text-gray-600">已取消</span>
        </div>
        <div class="flex items-center">
          <span class="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-500 border-dashed mr-2"></span>
          <span class="text-sm text-gray-600">待分配技师</span>
        </div>
        <div class="flex items-center">
          <span class="w-4 h-4 rounded bg-red-100 border-2 border-red-500 border-dashed mr-2"></span>
          <span class="text-sm text-gray-600">异常预约</span>
        </div>
        <div class="flex items-center">
          <span class="w-4 h-4 rounded bg-blue-500 ring-2 ring-red-400 ring-offset-1 mr-2"></span>
          <span class="text-sm text-gray-600">时间冲突</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getScheduleByDate } from '@/api/appointments';
import { getAllTechnicians } from '@/api/technicians';
import dayjs from 'dayjs';

const SLOT_HEIGHT_PX = 48;
const SLOT_MINUTES = 30;

interface Technician {
  id: number;
  name: string;
  phone: string;
}

interface Appointment {
  id: number;
  technician_id: number | null;
  appointment_time: string;
  service_name: string;
  duration: number;
  username: string;
  status: string;
  technician_name?: string;
  abnormalReason?: string;
}

interface ProcessedAppointment extends Appointment {
  isStart: boolean;
  startSlotIndex: number;
  slotSpan: number;
  hasConflict: boolean;
  conflictCount: number;
  conflictOffset: number;
}

const selectedDate = ref(dayjs().format('YYYY-MM-DD'));
const technicians = ref<Technician[]>([]);
const appointments = ref<Appointment[]>([]);

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const slotToIndex: Record<string, number> = {};
timeSlots.forEach((slot, idx) => {
  slotToIndex[slot] = idx;
});

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const isValidTimeSlot = (time: string): boolean => {
  return slotToIndex[time] !== undefined;
};

const getSlotSpan = (duration: number): number => {
  return Math.max(1, Math.ceil(duration / SLOT_MINUTES));
};

const headerCells = computed(() => {
  const cells: { key: string; label: string; subLabel?: string; isTime: boolean }[] = [
    { key: 'time-header', label: '时间', isTime: true }
  ];
  technicians.value.forEach(tech => {
    cells.push({
      key: `tech-${tech.id}`,
      label: tech.name,
      subLabel: tech.phone || '—',
      isTime: false
    });
  });
  return cells;
});

const gridStyle = computed(() => {
  const rows = timeSlots.length;
  return {
    gridTemplateColumns: `5rem repeat(${technicians.value.length}, 11rem)`,
    gridTemplateRows: `3rem repeat(${rows}, ${SLOT_HEIGHT_PX}px)`
  };
});

const unassignedAppointments = computed(() => {
  return appointments.value.filter(a => !a.technician_id && !a.abnormalReason);
});

const abnormalAppointments = computed(() => {
  return appointments.value.filter(a => a.abnormalReason);
});

interface AppointmentSlotMap {
  [techId: number]: {
    [slotIndex: number]: ProcessedAppointment[];
  };
}

const appointmentSlotMap = ref<AppointmentSlotMap>({});

const processAppointments = () => {
  const techById = new Map(technicians.value.map(t => [t.id, t]));
  const slotMap: AppointmentSlotMap = {};
  const techTimeAppointments: { [techId: number]: { [slotIndex: number]: ProcessedAppointment[] } } = {};

  technicians.value.forEach(tech => {
    slotMap[tech.id] = {};
    techTimeAppointments[tech.id] = {};
    timeSlots.forEach((_, idx) => {
      slotMap[tech.id][idx] = [];
      techTimeAppointments[tech.id][idx] = [];
    });
  });

  const validAppointments: ProcessedAppointment[] = [];
  const abnormalList: Appointment[] = [];
  const unassignedList: Appointment[] = [];

  for (const apt of appointments.value) {
    if (!apt.technician_id) {
      unassignedList.push(apt);
      continue;
    }

    const tech = techById.get(apt.technician_id);
    let abnormalReason: string | undefined;

    if (!tech) {
      abnormalReason = '技师不存在或已删除';
    } else if (!isValidTimeSlot(apt.appointment_time)) {
      abnormalReason = `开始时间「${apt.appointment_time}」不在标准时间格`;
    } else if (!apt.duration || apt.duration <= 0) {
      abnormalReason = `服务时长「${apt.duration}」无效`;
    } else {
      const endMin = timeToMinutes(apt.appointment_time) + apt.duration;
      const lastSlotMin = timeToMinutes(timeSlots[timeSlots.length - 1]) + SLOT_MINUTES;
      if (endMin > lastSlotMin) {
        abnormalReason = `服务结束时间超出排期范围（至${endMin}分钟）`;
      }
    }

    if (abnormalReason) {
      abnormalList.push({ ...apt, abnormalReason });
      continue;
    }

    const startIdx = slotToIndex[apt.appointment_time!];
    const slotSpan = getSlotSpan(apt.duration);

    const processed: ProcessedAppointment = {
      ...apt,
      isStart: true,
      startSlotIndex: startIdx,
      slotSpan,
      hasConflict: false,
      conflictCount: 0,
      conflictOffset: 0
    };

    validAppointments.push(processed);

    for (let i = 0; i < slotSpan && (startIdx + i) < timeSlots.length; i++) {
      const slotIdx = startIdx + i;
      techTimeAppointments[apt.technician_id!][slotIdx].push(processed);
    }
  }

  for (const techId of Object.keys(techTimeAppointments)) {
    const id = Number(techId);
    for (const slotIdx of Object.keys(techTimeAppointments[id])) {
      const idx = Number(slotIdx);
      const apts = techTimeAppointments[id][idx];

      if (apts.length > 1) {
        apts.forEach((apt, offset) => {
          apt.hasConflict = true;
          apt.conflictCount = apts.length - 1;
          apt.conflictOffset = offset;
        });
      }
    }
  }

  for (const apt of validAppointments) {
    const techId = apt.technician_id!;
    for (let i = 0; i < apt.slotSpan && (apt.startSlotIndex + i) < timeSlots.length; i++) {
      const slotIdx = apt.startSlotIndex + i;
      slotMap[techId][slotIdx].push({
        ...apt,
        isStart: i === 0
      });
    }
  }

  appointmentSlotMap.value = slotMap;

  appointments.value = [
    ...unassignedList,
    ...validAppointments,
    ...abnormalList
  ];
};

const fetchData = async () => {
  const [techRes, scheduleRes]: any = await Promise.all([
    getAllTechnicians(),
    getScheduleByDate(selectedDate.value)
  ]);
  technicians.value = techRes.technicians || [];
  appointments.value = scheduleRes.appointments || [];
  processAppointments();
};

const getAppointmentsAtSlot = (techId: number, slotIndex: number): ProcessedAppointment[] => {
  return appointmentSlotMap.value[techId]?.[slotIndex] || [];
};

const getAppointmentStyle = (apt: ProcessedAppointment) => {
  const topPx = 2;
  const heightPx = apt.slotSpan * SLOT_HEIGHT_PX - 4;

  let leftPx = 2;
  let widthPx = `calc(100% - 4px)`;

  if (apt.hasConflict && apt.conflictCount > 0) {
    leftPx = 2 + apt.conflictOffset * (100 / (apt.conflictCount + 1)) + apt.conflictOffset * 2;
    widthPx = `calc((100% - 4px - ${apt.conflictCount * 4}px) / ${apt.conflictCount + 1})`;

    return {
      top: `${topPx}px`,
      left: `${leftPx}px`,
      width: widthPx,
      height: `${heightPx}px`,
      zIndex: 20 + apt.conflictOffset
    };
  }

  return {
    top: `${topPx}px`,
    left: `${leftPx}px`,
    width: widthPx,
    height: `${heightPx}px`,
    zIndex: 10
  };
};

const getStatusBgClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-500',
    confirmed: 'bg-blue-500',
    processing: 'bg-green-500',
    completed: 'bg-gray-500',
    cancelled: 'bg-red-500'
  };
  return classes[status] || 'bg-gray-400';
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    processing: '维修中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return texts[status] || status;
};

const prevDay = () => {
  selectedDate.value = dayjs(selectedDate.value).subtract(1, 'day').format('YYYY-MM-DD');
  fetchData();
};

const nextDay = () => {
  selectedDate.value = dayjs(selectedDate.value).add(1, 'day').format('YYYY-MM-DD');
  fetchData();
};

onMounted(fetchData);
</script>
