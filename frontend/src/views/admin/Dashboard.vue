<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white rounded-xl shadow-md p-6"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">{{ stat.label }}</p>
            <p class="text-3xl font-bold mt-2" :class="stat.color">{{ stat.value }}</p>
          </div>
          <div class="text-4xl">{{ stat.icon }}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">今日预约</h3>
        <div class="space-y-3">
          <div
            v-for="apt in todayAppointments"
            :key="apt.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <p class="font-medium text-gray-800">{{ apt.service_name }}</p>
              <p class="text-sm text-gray-500">{{ apt.username }} - {{ apt.appointment_time }}</p>
            </div>
            <span
              class="px-3 py-1 rounded-full text-xs font-medium"
              :class="getStatusClass(apt.status)"
            >
              {{ getStatusText(apt.status) }}
            </span>
          </div>
          <p v-if="todayAppointments.length === 0" class="text-gray-500 text-center py-4">
            今日暂无预约
          </p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">进行中的工单</h3>
        <div class="space-y-3">
          <div
            v-for="order in activeWorkOrders"
            :key="order.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <p class="font-medium text-gray-800">{{ order.service_name }}</p>
              <p class="text-sm text-gray-500">{{ order.username }}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              维修中
            </span>
          </div>
          <p v-if="activeWorkOrders.length === 0" class="text-gray-500 text-center py-4">
            暂无进行中的工单
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAllAppointments } from '@/api/appointments';
import { getAllWorkOrders } from '@/api/workOrders';
import dayjs from 'dayjs';

const stats = ref([
  { label: '今日预约', value: 0, color: 'text-blue-600', icon: '📅' },
  { label: '待处理工单', value: 0, color: 'text-yellow-600', icon: '⏳' },
  { label: '进行中', value: 0, color: 'text-green-600', icon: '🔧' },
  { label: '已完成', value: 0, color: 'text-gray-600', icon: '✅' }
]);

const todayAppointments = ref<any[]>([]);
const activeWorkOrders = ref<any[]>([]);

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

onMounted(async () => {
  const [appointmentsRes, workOrdersRes] = await Promise.all([
    getAllAppointments(),
    getAllWorkOrders()
  ]);

  const appointments = (appointmentsRes as any).appointments;
  const workOrders = (workOrdersRes as any).workOrders;

  const today = dayjs().format('YYYY-MM-DD');
  todayAppointments.value = appointments.filter((a: any) => a.appointment_date === today);

  activeWorkOrders.value = workOrders.filter((o: any) => o.status === 'in_progress');

  stats.value[0].value = todayAppointments.value.length;
  stats.value[1].value = workOrders.filter((o: any) => o.status === 'waiting').length;
  stats.value[2].value = activeWorkOrders.value.length;
  stats.value[3].value = workOrders.filter((o: any) => o.status === 'completed').length;
});
</script>
