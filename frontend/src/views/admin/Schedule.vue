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
          @change="fetchSchedule"
        />
        <button
          @click="nextDay"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          下一天
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ selectedDate }} 排期表</h3>
      
      <div class="space-y-3">
        <div
          v-for="time in timeSlots"
          :key="time"
          class="flex items-center p-4 border border-gray-200 rounded-lg"
          :class="getSlotClass(time)"
        >
          <div class="w-20 font-medium text-gray-700">{{ time }}</div>
          <div class="flex-1">
            <template v-if="getAppointmentAtTime(time)">
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-medium text-gray-800">
                    {{ getAppointmentAtTime(time)?.service_name }}
                  </span>
                  <span class="text-sm text-gray-500 ml-2">
                    - {{ getAppointmentAtTime(time)?.username }}
                  </span>
                  <span class="text-sm text-gray-500 ml-2">
                    技师: {{ getAppointmentAtTime(time)?.technician_name || '待分配' }}
                  </span>
                </div>
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="getStatusClass(getAppointmentAtTime(time)?.status || '')"
                >
                  {{ getStatusText(getAppointmentAtTime(time)?.status || '') }}
                </span>
              </div>
            </template>
            <template v-else>
              <span class="text-gray-400">空闲</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getScheduleByDate } from '@/api/appointments';
import dayjs from 'dayjs';

const selectedDate = ref(dayjs().format('YYYY-MM-DD'));
const appointments = ref<any[]>([]);

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const fetchSchedule = async () => {
  const res: any = await getScheduleByDate(selectedDate.value);
  appointments.value = res.appointments;
};

const getAppointmentAtTime = (time: string) => {
  return appointments.value.find(a => a.appointment_time === time);
};

const getSlotClass = (time: string) => {
  const apt = getAppointmentAtTime(time);
  if (apt) {
    return 'bg-blue-50 border-blue-200';
  }
  return 'bg-white';
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
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
  fetchSchedule();
};

const nextDay = () => {
  selectedDate.value = dayjs(selectedDate.value).add(1, 'day').format('YYYY-MM-DD');
  fetchSchedule();
};

onMounted(fetchSchedule);
</script>
