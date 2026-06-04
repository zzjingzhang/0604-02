<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">维修进度</h1>
    
    <div class="space-y-6">
      <div
        v-for="order in workOrders"
        :key="order.id"
        class="bg-white rounded-xl shadow-md p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">{{ order.service_name }}</h3>
            <p class="text-sm text-gray-500">
              预约时间：{{ order.appointment_date }} {{ order.appointment_time }}
            </p>
            <p class="text-sm text-gray-500">
              技师：{{ order.technician_name || '待分配' }}
            </p>
          </div>
          <span
            class="px-3 py-1 rounded-full text-sm font-medium"
            :class="getStatusClass(order.status)"
          >
            {{ getStatusText(order.status) }}
          </span>
        </div>

        <div class="mt-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-600">维修进度</span>
            <span class="text-sm text-gray-500">{{ getProgressPercent(order.status) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div
              class="bg-blue-600 h-3 rounded-full transition-all duration-500"
              :style="{ width: getProgressPercent(order.status) + '%' }"
            ></div>
          </div>
        </div>

        <div v-if="order.progress" class="mt-4 p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600">{{ order.progress }}</p>
        </div>

        <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span v-if="order.start_time">开始时间：{{ formatTime(order.start_time) }}</span>
          <span v-if="order.end_time">完成时间：{{ formatTime(order.end_time) }}</span>
        </div>
      </div>

      <div v-if="workOrders.length === 0" class="bg-white rounded-xl shadow-md p-12 text-center">
        <p class="text-gray-500">暂无维修记录</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMyWorkOrders } from '@/api/workOrders';
import dayjs from 'dayjs';

const workOrders = ref<any[]>([]);

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    waiting: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    waiting: '等待维修',
    in_progress: '维修中',
    completed: '已完成'
  };
  return texts[status] || status;
};

const getProgressPercent = (status: string) => {
  const percents: Record<string, number> = {
    waiting: 0,
    in_progress: 50,
    completed: 100
  };
  return percents[status] || 0;
};

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm');
};

onMounted(async () => {
  const res: any = await getMyWorkOrders();
  workOrders.value = res.workOrders;
});
</script>
